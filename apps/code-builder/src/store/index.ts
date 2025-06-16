import { create } from 'zustand'
import type { ComponentConfig, GlobalConfig, EditorState, ComponentSelector, ChatMessage } from '../types'
import { ASTParser } from '../utils/simpleParser'
import { CodeTemplateManager } from '../utils/codeTemplate'

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
  toggleCodeView: () => void
  setComponentVisibility: (componentId: string, visible: boolean) => void
  expandComponent: (componentId: string) => void
  collapseComponent: (componentId: string) => void
}

const useCodeBuilderStore = create<CodeBuilderState>((set, get) => ({
  // 初始状态
  editorState: {
    code: CodeTemplateManager.generatePageCode(
      CodeTemplateManager.getDefaultGlobalConfig(),
      '// 在这里开始构建您的页面组件'
    ),
    selectedComponentId: null,
    isCodeView: false,
    isDirty: false
  },

  globalConfig: CodeTemplateManager.getDefaultGlobalConfig(),

  components: [],

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
    state.astParser.updateCode(code)
    const components = state.astParser.extractComponents()

    set(() => ({
      editorState: {
        ...state.editorState,
        code,
        isDirty: true
      },
      components
    }))
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
}))

export default useCodeBuilderStore
