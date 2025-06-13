import React from 'react'
import { useDrag } from 'react-dnd'
import { Collapse, Typography, Space } from 'antd'
import { 
  FormOutlined, 
  TableOutlined, 
  AppstoreOutlined,
  FileTextOutlined,
  LayoutOutlined,
  DashboardOutlined,
  SelectOutlined,
  CalendarOutlined,
  ColumnWidthOutlined
} from '@ant-design/icons'

import { componentsByCategory, categoryNames } from '../config/components'
import type { ComponentDefinition } from '../types'
import { DragItem } from '../types'

const { Panel } = Collapse
const { Text } = Typography

interface ComponentPanelProps {
  onAddComponent: (componentType: string, defaultProps: Record<string, any>) => void
}

// 组件图标映射
const componentIcons: Record<string, React.ReactNode> = {
  Input: <FormOutlined />,
  TextArea: <FormOutlined />,
  Button: <AppstoreOutlined />,
  Select: <SelectOutlined />,
  DatePicker: <CalendarOutlined />,
  Card: <FileTextOutlined />,
  Row: <LayoutOutlined />,
  Col: <ColumnWidthOutlined />,
  Space: <LayoutOutlined />,
  Form: <FormOutlined />,
  Table: <TableOutlined />,
  PageListQuery: <DashboardOutlined />,
  ModalForm: <FormOutlined />
}

// 类别图标映射  
const categoryIcons: Record<string, React.ReactNode> = {
  general: <AppstoreOutlined />,
  layout: <LayoutOutlined />,
  form: <FormOutlined />,
  data: <TableOutlined />,
  page: <DashboardOutlined />
}

// 可拖拽的组件项
const DraggableComponent: React.FC<{
  component: ComponentDefinition
  onAddComponent: (componentType: string, defaultProps: Record<string, any>) => void
}> = ({ component, onAddComponent }) => {
  const [{ isDragging }, drag] = useDrag<DragItem, void, { isDragging: boolean }>({
    type: 'COMPONENT',
    item: { type: 'COMPONENT', componentType: component.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })

  const handleClick = () => {
    onAddComponent(component.type, component.defaultProps)
  }

  return (
    <div
      ref={drag}
      className="component-item"
      onClick={handleClick}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      <Space>
        {componentIcons[component.type]}
        <Text>{component.name}</Text>
      </Space>
    </div>
  )
}

const ComponentPanel: React.FC<ComponentPanelProps> = ({ onAddComponent }) => {
  return (
    <div style={{ padding: '8px 0' }}>
      <Collapse 
        defaultActiveKey={Object.keys(componentsByCategory)}
        ghost
        size="small"
      >
        {Object.entries(componentsByCategory).map(([category, components]) => (
          <Panel
            key={category}
            header={
              <Space>
                {categoryIcons[category]}
                <Text strong>{categoryNames[category as keyof typeof categoryNames]}</Text>
              </Space>
            }
          >
            {components.map(component => (
              <DraggableComponent
                key={component.type}
                component={component}
                onAddComponent={onAddComponent}
              />
            ))}
          </Panel>
        ))}
      </Collapse>
    </div>
  )
}

export default ComponentPanel