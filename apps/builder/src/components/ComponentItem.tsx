import React, { useState, useRef, useEffect } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { Button } from 'antd'
import { DeleteOutlined, DragOutlined } from '@ant-design/icons'

import type { ComponentConfig, DragItem, DropPosition } from '../types'
import { componentDefinitions } from '../config/components'
import ComponentRenderer from './ComponentRenderer'

interface ComponentItemProps {
  component: ComponentConfig
  isSelected: boolean
  isDragging: boolean
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onDrop: (item: DragItem, position: DropPosition) => void
  onDragStateChange: (isDragging: boolean, dragType: 'COMPONENT' | 'COMPONENT_MOVE' | null) => void
  children?: React.ReactNode
}

interface DropZoneState {
  position: 'before' | 'after' | 'inside' | null
  isActive: boolean
}

const ComponentItem: React.FC<ComponentItemProps> = ({
  component,
  isSelected,
  isDragging,
  onSelect,
  onDelete,
  onDrop,
  onDragStateChange,
  children
}) => {
  const [dropZone, setDropZone] = useState<DropZoneState>({ position: null, isActive: false })
  const elementRef = useRef<HTMLDivElement>(null)

  // 获取组件定义
  const componentDef = componentDefinitions.find(def => def.type === component.type)
  const isContainer = componentDef?.isContainer
  const hasChildren = children && React.Children.count(children) > 0
  const isInputComponent = [
    'Input', 'TextArea', 'Select', 'DatePicker', 'Button',
    'Text', 'Title', 'Image', 'Divider', 'Tag', 'Checkbox',
    'Radio', 'Switch', 'Slider', 'Rate', 'Progress', 'Badge'
  ].includes(component.type)

  // 拖拽设置
  const [{ isDraggingThis }, drag, dragPreview] = useDrag({
    type: 'COMPONENT_MOVE',
    item: () => {
      onDragStateChange(true, 'COMPONENT_MOVE')
      return {
        type: 'COMPONENT_MOVE',
        componentType: component.type,
        componentId: component.id,
        component: component
      }
    },
    collect: (monitor) => ({
      isDraggingThis: monitor.isDragging()
    }),
    end: () => {
      onDragStateChange(false, null)
    }
  })

  // 放置区域设置
  const [{ isOver }, drop] = useDrop({
    accept: ['COMPONENT', 'COMPONENT_MOVE'],
    hover: (item: DragItem, monitor) => {
      if (!elementRef.current || !monitor.isOver({ shallow: true })) {
        setDropZone({ position: null, isActive: false })
        return
      }

      const hoverBoundingRect = elementRef.current.getBoundingClientRect()
      const clientOffset = monitor.getClientOffset()

      if (!clientOffset) {
        setDropZone({ position: null, isActive: false })
        return
      }

      // 计算相对位置
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const hoverClientY = clientOffset.y - hoverBoundingRect.top
      const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2
      const hoverClientX = clientOffset.x - hoverBoundingRect.left

      // 判断放置位置
      let position: 'before' | 'after' | 'inside' | null = null

      if (isContainer && !hasChildren) {
        // 容器组件且无子组件时，优先判断内部放置
        const margin = 20 // 边缘区域
        if (
          hoverClientY > margin &&
          hoverClientY < hoverBoundingRect.height - margin &&
          hoverClientX > margin &&
          hoverClientX < hoverBoundingRect.width - margin
        ) {
          position = 'inside'
        } else if (hoverClientY < hoverMiddleY) {
          position = 'before'
        } else {
          position = 'after'
        }
      } else {
        // 普通组件或有子组件的容器
        if (hoverClientY < hoverMiddleY / 2) {
          position = 'before'
        } else if (hoverClientY > hoverBoundingRect.height - hoverMiddleY / 2) {
          position = 'after'
        } else if (isContainer) {
          position = 'inside'
        }
      }

      setDropZone({
        position,
        isActive: position !== null
      })
    },
    drop: (item: DragItem, monitor) => {
      if (monitor.isOver({ shallow: true }) && dropZone.position) {
        onDrop(item, { type: dropZone.position, targetId: component.id })
      }
      // 清除拖放状态
      setDropZone({ position: null, isActive: false })
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop()
    })
  })

  // 清除拖拽状态
  useEffect(() => {
    if (!isDragging) {
      setDropZone({ position: null, isActive: false })
    }
  }, [isDragging])

  // 清除hover状态
  useEffect(() => {
    if (!isOver) {
      setDropZone({ position: null, isActive: false })
    }
  }, [isOver])

  // 合并refs
  const combinedRef = (el: HTMLDivElement | null) => {
    elementRef.current = el
    drop(el)
    dragPreview(el)
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect(component.id)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(component.id)
  }

  // 渲染拖放指示器
  const renderDropIndicator = () => {
    if (!dropZone.isActive || !dropZone.position) return null

    const indicatorStyle: React.CSSProperties = {
      position: 'absolute',
      zIndex: 1000,
      pointerEvents: 'none'
    }

    switch (dropZone.position) {
      case 'before':
        return (
          <div
            style={{
              ...indicatorStyle,
              top: '-2px',
              left: 0,
              right: 0,
              height: '4px',
              backgroundColor: '#1890ff',
              borderRadius: '2px'
            }}
          />
        )
      case 'after':
        return (
          <div
            style={{
              ...indicatorStyle,
              bottom: '-2px',
              left: 0,
              right: 0,
              height: '4px',
              backgroundColor: '#1890ff',
              borderRadius: '2px'
            }}
          />
        )
      case 'inside':
        return (
          <div
            style={{
              ...indicatorStyle,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              border: '2px dashed #1890ff',
              backgroundColor: 'rgba(24, 144, 255, 0.1)',
              borderRadius: '4px'
            }}
          />
        )
      default:
        return null
    }
  }

  return (
    <div
      ref={combinedRef}
      className={`component-item ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
      style={{
        position: 'relative',
        margin: isInputComponent ? '4px 0' : '8px 0',
        opacity: isDraggingThis ? 0.5 : 1,
        outline: isSelected ? '2px solid #1890ff' : 'none',
        outlineOffset: isInputComponent ? '1px' : '2px',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
    >
      {/* 拖放指示器 */}
      {renderDropIndicator()}

      {/* 选中状态的工具栏 */}
      {isSelected && (
        <>
          <div
            ref={drag}
            style={{
              position: 'absolute',
              top: '-8px',
              left: '-8px',
              zIndex: 100,
              cursor: 'move',
              background: '#1890ff',
              color: 'white',
              width: '20px',
              height: '20px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px'
            }}
          >
            <DragOutlined />
          </div>

          <Button
            type="primary"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={handleDelete}
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              zIndex: 100,
              minWidth: '20px',
              height: '20px',
              padding: 0,
              fontSize: '10px'
            }}
          />
        </>
      )}

      {/* 组件内容 */}
      <ComponentRenderer component={component}>
        {children}
      </ComponentRenderer>
    </div>
  )
}

export default ComponentItem
