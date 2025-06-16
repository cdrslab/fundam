import React, { useCallback, useState } from 'react'
import { useDrop } from 'react-dnd'
import { Empty } from 'antd'

import { ComponentConfig, DragItem, DropPosition } from '../types'
import { componentDefinitions } from '../config/components'
import ComponentItem from './ComponentItem'

interface CanvasProps {
  components: ComponentConfig[]
  selectedId: string | null
  onSelectComponent: (id: string | null) => void
  onAddComponent: (componentType: string, defaultProps: Record<string, any>, position?: DropPosition) => void
  onDeleteComponent: (id: string) => void
  onMoveComponent: (componentId: string, position: DropPosition) => void
}

const Canvas: React.FC<CanvasProps> = ({
  components,
  selectedId,
  onSelectComponent,
  onAddComponent,
  onDeleteComponent,
  onMoveComponent
}) => {
  const [dragState, setDragState] = useState<{
    isDragging: boolean
    dragType: 'COMPONENT' | 'COMPONENT_MOVE' | null
  }>({
    isDragging: false,
    dragType: null
  })

  // 处理拖放到空画布
  const [{ isOver }, drop] = useDrop({
    accept: ['COMPONENT', 'COMPONENT_MOVE'],
    drop: (item: DragItem, monitor) => {
      // 确保是拖放到最外层画布
      if (monitor.isOver({ shallow: true })) {
        if (item.type === 'COMPONENT') {
          const componentDef = componentDefinitions.find(def => def.type === item.componentType)
          if (componentDef) {
            onAddComponent(item.componentType, componentDef.defaultProps)
          }
        }
      }
    },
    hover: (item: DragItem, monitor) => {
      if (monitor.isOver({ shallow: true })) {
        setDragState({
          isDragging: true,
          dragType: item.type as 'COMPONENT' | 'COMPONENT_MOVE'
        })
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }) && monitor.canDrop()
    })
  })

  // 处理画布点击（取消选中）
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // 只有点击空白区域才取消选中
    if (e.target === e.currentTarget) {
      onSelectComponent(null)
    }
  }, [onSelectComponent])

  // 处理拖拽状态变化
  const handleDragStateChange = useCallback((isDragging: boolean, dragType: 'COMPONENT' | 'COMPONENT_MOVE' | null) => {
    setDragState({ isDragging, dragType })
  }, [])

  // 处理组件拖放
  const handleComponentDrop = useCallback((item: DragItem, position: DropPosition) => {
    if (item.type === 'COMPONENT') {
      const componentDef = componentDefinitions.find(def => def.type === item.componentType)
      if (componentDef) {
        onAddComponent(item.componentType, componentDef.defaultProps, position)
      }
    } else if (item.type === 'COMPONENT_MOVE' && item.componentId) {
      onMoveComponent(item.componentId, position)
    }
  }, [onAddComponent, onMoveComponent])

  // 递归渲染组件树
  const renderComponentTree = (componentList: ComponentConfig[]): React.ReactNode => {
    return componentList.map(component => {
      const children = components.filter(c => c.parentId === component.id)
      
      return (
        <ComponentItem
          key={component.id}
          component={component}
          isSelected={selectedId === component.id}
          isDragging={dragState.isDragging}
          onSelect={onSelectComponent}
          onDelete={onDeleteComponent}
          onDrop={handleComponentDrop}
          onDragStateChange={handleDragStateChange}
        >
          {children.length > 0 ? renderComponentTree(children) : undefined}
        </ComponentItem>
      )
    })
  }

  // 获取根组件（没有parentId的组件）
  const rootComponents = components.filter(c => !c.parentId)
  
  return (
    <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
      <div
        ref={drop}
        className="canvas-container"
        onClick={handleCanvasClick}
        style={{ 
          position: 'relative', 
          padding: '20px',
          minHeight: 'calc(100vh - 60px)',
          backgroundColor: isOver ? 'rgba(24, 144, 255, 0.05)' : 'transparent',
          transition: 'background-color 0.2s ease'
        }}
      >
      {rootComponents.length === 0 ? (
        <div
          className="empty-canvas"
          style={{ 
            minHeight: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: isOver ? '2px dashed #1890ff' : '2px dashed #d9d9d9',
            borderRadius: '8px',
            backgroundColor: isOver ? 'rgba(24, 144, 255, 0.1)' : 'transparent',
            transition: 'all 0.2s ease'
          }}
        >
          <Empty
            description="拖拽组件到这里开始搭建页面，或使用AI助手生成页面"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      ) : (
        <div className="component-tree">
          {renderComponentTree(rootComponents)}
        </div>
      )}
      </div>
    </div>
  )
}

export default Canvas