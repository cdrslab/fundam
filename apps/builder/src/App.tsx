import React, { useState, useCallback } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Button, Space } from 'antd'
import { CodeOutlined, SettingOutlined } from '@ant-design/icons'

import Sidebar from './components/Sidebar'
import Canvas from './components/Canvas'
import PropertiesPanel from './components/PropertiesPanel'
import CodePreview from './components/CodePreview'
import GlobalConfigPanel from './components/GlobalConfigPanel'
import { ComponentConfig, CanvasState, DropPosition } from './types'
import { generateId } from './utils/helpers'
import { CanvasContext } from './hooks/useCanvasComponents'

const App: React.FC = () => {
  const [canvasState, setCanvasState] = useState<CanvasState>({
    components: [],
    selectedId: null
  })
  const [showCode, setShowCode] = useState(false)
  const [showGlobalConfig, setShowGlobalConfig] = useState(false)

  // 添加组件到画布
  const addComponent = useCallback((
    componentType: string, 
    defaultProps: Record<string, any>, 
    position?: DropPosition
  ) => {
    const newComponent: ComponentConfig = {
      id: generateId(),
      type: componentType,
      name: componentType,
      props: { ...defaultProps }
    }

    setCanvasState(prev => {
      const newComponents = [...prev.components]
      
      if (position) {
        const { type: posType, targetId } = position
        
        if (posType === 'inside') {
          // 放到容器内部
          newComponent.parentId = targetId || undefined
        } else {
          // 放到组件前后
          const targetIndex = newComponents.findIndex(c => c.id === targetId)
          const targetComponent = newComponents[targetIndex]
          
          if (targetComponent) {
            newComponent.parentId = targetComponent.parentId
            
            if (posType === 'before') {
              newComponents.splice(targetIndex, 0, newComponent)
              return {
                ...prev,
                components: newComponents,
                selectedId: newComponent.id
              }
            } else if (posType === 'after') {
              newComponents.splice(targetIndex + 1, 0, newComponent)
              return {
                ...prev,
                components: newComponents,
                selectedId: newComponent.id
              }
            }
          }
        }
      }
      
      // 默认添加到末尾
      return {
        ...prev,
        components: [...newComponents, newComponent],
        selectedId: newComponent.id
      }
    })
  }, [])

  // 移动组件
  const moveComponent = useCallback((componentId: string, position: DropPosition) => {
    setCanvasState(prev => {
      const components = [...prev.components]
      const componentIndex = components.findIndex(c => c.id === componentId)
      const component = components[componentIndex]
      
      if (!component) return prev
      
      // 移除原组件
      components.splice(componentIndex, 1)
      
      const { type: posType, targetId } = position
      
      if (posType === 'inside') {
        // 移动到容器内部
        component.parentId = targetId || undefined
        components.push(component)
      } else {
        // 移动到组件前后
        const targetIndex = components.findIndex(c => c.id === targetId)
        const targetComponent = components[targetIndex]
        
        if (targetComponent) {
          component.parentId = targetComponent.parentId
          
          if (posType === 'before') {
            components.splice(targetIndex, 0, component)
          } else if (posType === 'after') {
            components.splice(targetIndex + 1, 0, component)
          }
        }
      }
      
      return {
        ...prev,
        components
      }
    })
  }, [])

  // 选中组件
  const selectComponent = useCallback((id: string | null) => {
    setCanvasState(prev => ({
      ...prev,
      selectedId: id
    }))
  }, [])

  // 更新组件属性
  const updateComponent = useCallback((id: string, props: Record<string, any>) => {
    setCanvasState(prev => ({
      ...prev,
      components: prev.components.map(comp =>
        comp.id === id ? { ...comp, props: { ...comp.props, ...props } } : comp
      )
    }))
  }, [])

  // 删除组件（包括子组件）
  const deleteComponent = useCallback((id: string) => {
    setCanvasState(prev => {
      const deleteIds = new Set([id])
      
      // 递归查找所有子组件
      const findChildren = (parentId: string) => {
        prev.components.forEach(comp => {
          if (comp.parentId === parentId) {
            deleteIds.add(comp.id)
            findChildren(comp.id)
          }
        })
      }
      
      findChildren(id)
      
      return {
        ...prev,
        components: prev.components.filter(comp => !deleteIds.has(comp.id)),
        selectedId: prev.selectedId === id ? null : prev.selectedId
      }
    })
  }, [])

  // 获取选中的组件
  const selectedComponent = canvasState.components.find(comp => comp.id === canvasState.selectedId)

  return (
    <CanvasContext.Provider value={{ components: canvasState.components }}>
      <DndProvider backend={HTML5Backend}>
        <div className="builder-layout">
          <div className="builder-sidebar">
            <Sidebar onAddComponent={addComponent} />
          </div>
          
          <div className="builder-canvas">
            <Canvas
              components={canvasState.components}
              selectedId={canvasState.selectedId}
              onSelectComponent={selectComponent}
              onAddComponent={addComponent}
              onDeleteComponent={deleteComponent}
              onMoveComponent={moveComponent}
            />
            
            {/* 操作按钮 */}
            <div className="code-preview">
              <Space>
                <Button
                  icon={<SettingOutlined />}
                  onClick={() => setShowGlobalConfig(true)}
                >
                  全局配置
                </Button>
                <Button
                  type="primary"
                  icon={<CodeOutlined />}
                  onClick={() => setShowCode(!showCode)}
                >
                  {showCode ? '隐藏代码' : '查看代码'}
                </Button>
              </Space>
            </div>
          </div>
          
          <div className="builder-properties">
            <PropertiesPanel
              component={selectedComponent}
              onUpdateComponent={updateComponent}
            />
          </div>
        </div>

        {/* 代码预览弹窗 */}
        {showCode && (
          <CodePreview
            components={canvasState.components}
            visible={showCode}
            onClose={() => setShowCode(false)}
          />
        )}

        {/* 全局配置弹窗 */}
        <GlobalConfigPanel
          visible={showGlobalConfig}
          onClose={() => setShowGlobalConfig(false)}
        />
      </DndProvider>
    </CanvasContext.Provider>
  )
}

export default App