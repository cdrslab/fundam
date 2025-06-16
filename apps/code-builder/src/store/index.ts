import { create } from 'zustand'
import type { ComponentConfig, GlobalConfig, EditorState, ComponentSelector, ChatMessage } from '../types'
import { ASTParser } from '../utils/simpleParser'
import { CodeTemplateManager } from '../utils/codeTemplate'
import { v4 as uuidv4 } from 'uuid'

// 简单的组件解析函数
function parseComponentsFromCode(code: string): ComponentConfig[] {
  // console.log('=== 开始解析代码 ===')
  // console.log('代码内容:', code)

  const components: ComponentConfig[] = []

  try {
    // 定义Fundam组件类型
    const fundamComponents = [
      'PageListQuery', 'FormItemInput', 'FormItemSelect', 'ModalForm', 'ProTable',
      'Button', 'Input', 'Card', 'Form', 'Table', 'Modal', 'Select', 'DatePicker'
    ]

    // 使用更简单的正则表达式
    const componentRegex = /<(\w+)([^>\/]*?)(?:\s*\/?>|>[^<]*<\/\1>)/g
    let match
    let componentIndex = 0

    while ((match = componentRegex.exec(code)) !== null) {
      const componentType = match[1]
      const propsString = match[2] ? match[2].trim() : ''

      // console.log('找到组件:', { componentType, propsString, fullMatch: match[0] })

      // 只解析Fundam组件，跳过HTML标签和div等
      if (fundamComponents.includes(componentType)) {
        const componentId = uuidv4()
        const componentName = `${componentType}${componentIndex + 1}`

        // console.log('解析Fundam组件:', { componentType, componentName })

        // 简化props解析
        const props: Record<string, any> = {}
        if (propsString) {
          // 基础的属性解析
          const propMatches = propsString.match(/(\w+)=("[^"]*"|\{[^}]*\})/g)
          if (propMatches) {
            propMatches.forEach(propMatch => {
              const [, propName, propValue] = propMatch.match(/(\w+)=(.+)/) || []
              if (propName && propValue) {
                if (propValue.startsWith('"') && propValue.endsWith('"')) {
                  props[propName] = propValue.slice(1, -1)
                } else {
                  props[propName] = propValue
                }
              }
            })
          }
        }

        const component: ComponentConfig = {
          identity: {
            id: componentId,
            name: componentName,
            type: componentType,
            description: `${componentType}组件`,
            parentId: null
          },
          position: {
            line: code.substring(0, match.index).split('\n').length,
            column: code.substring(0, match.index).split('\n').pop()?.length || 0,
            startOffset: match.index,
            endOffset: match.index + match[0].length
          },
          props,
          events: {},
          isVisible: true,
          isExpanded: false,
          aiSummary: `自动识别的${componentType}组件`
        }

        // console.log('创建组件配置:', component)
        components.push(component)
        componentIndex++
      }
    }

    // console.log('解析结果:', components)

  } catch (error) {
    console.error('组件解析失败:', error)
  }

  return components
}

interface CodeBuilderState {
  // 编辑器状态
  editorState: EditorState

  // 全局配置
  globalConfig: GlobalConfig

  // 组件状态
  components: ComponentConfig[]
  componentSelector: ComponentSelector

  // AI对话
  chatMessages: ChatMessage[]

  // AST解析器实例
  astParser: ASTParser

  // 选中的组件 (computed)
  selectedComponent: ComponentConfig | undefined

  // Actions
  updateCode: (code: string) => void
  updateGlobalConfig: (config: Partial<GlobalConfig>) => void
  selectComponent: (componentId: string | null) => void
  updateComponentProps: (componentId: string, props: Record<string, any>) => void
  addChatMessage: (message: ChatMessage) => void
  clearChatMessages: () => void
  toggleCodeView: () => void
  setComponentVisibility: (componentId: string, visible: boolean) => void
  expandComponent: (componentId: string) => void
  collapseComponent: (componentId: string) => void
}

const useCodeBuilderStore = create<CodeBuilderState>((set, get) => {
    // 生成初始代码 - 使用更简单的模板进行测试
    const initialCode = `import React from 'react'
import { Button } from 'antd'
import { PageListQuery } from '@fundam/antd'

const GeneratedPage: React.FC = () => {
  return (
    <div className="page-container">
      {/* 在这里开始构建您的页面组件 */}
    </div>
  )
}

export default GeneratedPage`
  // 解析初始代码中的组件
  const initialComponents = parseComponentsFromCode(initialCode)

  return {
    // 初始状态
    editorState: {
      code: initialCode,
      selectedComponentId: null,
      isCodeView: false,
      isDirty: false
    },

    globalConfig: CodeTemplateManager.getDefaultGlobalConfig(),

    components: initialComponents,

    componentSelector: {
      selectedId: null,
      hoveredId: null,
      expandedIds: []
    },

    chatMessages: [],

    astParser: new ASTParser(),

    // Computed properties
    get selectedComponent() {
      const state = get()
      return state.components.find(comp => comp.identity.id === state.componentSelector.selectedId)
    },

    // Actions
    updateCode: (code: string) => {
      const state = get()

      // 使用简单的组件解析
      const components = parseComponentsFromCode(code)

      set(() => ({
        editorState: {
          ...state.editorState,
          code,
          isDirty: true
        },
        components
      }))

      // 同时更新AST解析器
      try {
        state.astParser.updateCode(code)
      } catch (error) {
        console.warn('AST解析失败，使用简单解析器结果:', error)
      }
    },

    updateGlobalConfig: (config: Partial<GlobalConfig>) => {
      set((state) => {
        const newGlobalConfig = { ...state.globalConfig, ...config }

        // 重新生成代码模板
        const newCode = CodeTemplateManager.generatePageCode(
          newGlobalConfig,
          '// 配置已更新，请重新构建页面组件'
        )

        // 更新AST
        state.astParser.updateCode(newCode)

        return {
          globalConfig: newGlobalConfig,
          editorState: {
            ...state.editorState,
            code: newCode,
            isDirty: true
          }
        }
      })
    },

    selectComponent: (componentId: string | null) => {
      set((state) => ({
        componentSelector: {
          ...state.componentSelector,
          selectedId: componentId
        },
        editorState: {
          ...state.editorState,
          selectedComponentId: componentId
        }
      }))
    },

    updateComponentProps: (componentId: string, props: Record<string, any>) => {
      set((state) => {
        // 更新组件配置
        const updatedComponents = state.components.map(comp =>
          comp.identity.id === componentId
            ? { ...comp, props: { ...comp.props, ...props } }
            : comp
        )

        // 更新AST中的代码
        const newCode = state.astParser.updateComponentInAST(componentId, props)

        return {
          components: updatedComponents,
          editorState: {
            ...state.editorState,
            code: newCode,
            isDirty: true
          }
        }
      })
    },

    addChatMessage: (message: ChatMessage) => {
      set((state) => ({
        chatMessages: [...state.chatMessages, message]
      }))
    },

    clearChatMessages: () => {
      set(() => ({
        chatMessages: []
      }))
    },

    toggleCodeView: () => {
      set((state) => ({
        editorState: {
          ...state.editorState,
          isCodeView: !state.editorState.isCodeView
        }
      }))
    },

    setComponentVisibility: (componentId: string, visible: boolean) => {
      set((state) => ({
        components: state.components.map(comp =>
          comp.identity.id === componentId
            ? { ...comp, isVisible: visible }
            : comp
        )
      }))
    },

    expandComponent: (componentId: string) => {
      set((state) => ({
        componentSelector: {
          ...state.componentSelector,
          expandedIds: [...state.componentSelector.expandedIds, componentId]
        }
      }))
    },

    collapseComponent: (componentId: string) => {
      set((state) => ({
        componentSelector: {
          ...state.componentSelector,
          expandedIds: state.componentSelector.expandedIds.filter(id => id !== componentId)
        }
      }))
    }
  }
})

export default useCodeBuilderStore
