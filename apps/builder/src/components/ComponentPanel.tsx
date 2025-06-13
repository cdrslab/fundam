import React, { useState, useMemo } from 'react'
import { useDrag } from 'react-dnd'
import { Collapse, Typography, Space, Input } from 'antd'
import type { CollapseProps } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { 
  FormOutlined, 
  TableOutlined, 
  AppstoreOutlined,
  FileTextOutlined,
  LayoutOutlined,
  DashboardOutlined,
  SelectOutlined,
  CalendarOutlined,
  ColumnWidthOutlined,
  FontSizeOutlined,
  PictureOutlined,
  LineOutlined,
  TagOutlined,
  AlertOutlined,
  CheckSquareOutlined,
  SwitcherOutlined,
  ControlOutlined,
  StarOutlined,
  BarChartOutlined,
  PercentageOutlined,
  NumberOutlined,
  BlockOutlined,
  MenuFoldOutlined
} from '@ant-design/icons'

import { componentsByCategory, categoryNames } from '../config/components'
import type { ComponentDefinition } from '../types'
import { DragItem } from '../types'

const { Text } = Typography

interface ComponentPanelProps {
  onAddComponent: (componentType: string, defaultProps: Record<string, any>) => void
}

// 组件图标映射
const componentIcons: Record<string, React.ReactNode> = {
  // 表单组件
  Input: <FormOutlined />,
  TextArea: <FormOutlined />,
  Button: <AppstoreOutlined />,
  Select: <SelectOutlined />,
  DatePicker: <CalendarOutlined />,
  Checkbox: <CheckSquareOutlined />,
  CheckboxGroup: <CheckSquareOutlined />,
  Radio: <CheckSquareOutlined />,
  RadioGroup: <CheckSquareOutlined />,
  Switch: <SwitcherOutlined />,
  Slider: <ControlOutlined />,
  Rate: <StarOutlined />,
  Form: <FormOutlined />,
  ModalForm: <FormOutlined />,
  
  // 布局组件
  Card: <FileTextOutlined />,
  Row: <LayoutOutlined />,
  Col: <ColumnWidthOutlined />,
  Space: <LayoutOutlined />,
  Tabs: <BlockOutlined />,
  Collapse: <MenuFoldOutlined />,
  
  // 数据展示组件
  Table: <TableOutlined />,
  Statistic: <NumberOutlined />,
  Progress: <PercentageOutlined />,
  Badge: <NumberOutlined />,
  
  // 通用组件
  Text: <FontSizeOutlined />,
  Title: <FontSizeOutlined />,
  Image: <PictureOutlined />,
  Divider: <LineOutlined />,
  Tag: <TagOutlined />,
  Alert: <AlertOutlined />,
  
  // 页面模板
  PageListQuery: <DashboardOutlined />,
  
  // 业务组件
  UserProfile: <FormOutlined />,
  StatsCard: <BarChartOutlined />,
  ProductCard: <AppstoreOutlined />,
  TimelineItem: <BarChartOutlined />,
  ContactInfo: <FormOutlined />
}

// 类别图标映射  
const categoryIcons: Record<string, React.ReactNode> = {
  general: <AppstoreOutlined />,
  layout: <LayoutOutlined />,
  form: <FormOutlined />,
  data: <TableOutlined />,
  page: <DashboardOutlined />,
  business: <AppstoreOutlined />
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
  const [searchText, setSearchText] = useState('')

  // 过滤组件
  const filteredComponentsByCategory = useMemo(() => {
    if (!searchText) return componentsByCategory

    const filtered: Record<string, ComponentDefinition[]> = {}
    
    Object.entries(componentsByCategory).forEach(([category, components]) => {
      const filteredComponents = components.filter(component =>
        component.name.toLowerCase().includes(searchText.toLowerCase()) ||
        component.type.toLowerCase().includes(searchText.toLowerCase())
      )
      
      if (filteredComponents.length > 0) {
        filtered[category] = filteredComponents
      }
    })
    
    return filtered
  }, [searchText])

  // 为Collapse组件生成items
  const collapseItems: CollapseProps['items'] = useMemo(() => {
    return Object.entries(filteredComponentsByCategory).map(([category, components]) => ({
      key: category,
      label: (
        <Space>
          {categoryIcons[category]}
          <Text strong>{categoryNames[category as keyof typeof categoryNames]}</Text>
          <Text type="secondary">({components.length})</Text>
        </Space>
      ),
      children: (
        <div>
          {components.map(component => (
            <DraggableComponent
              key={component.type}
              component={component}
              onAddComponent={onAddComponent}
            />
          ))}
        </div>
      )
    }))
  }, [filteredComponentsByCategory, onAddComponent])

  return (
    <div style={{ padding: '8px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 搜索框 */}
      <div style={{ marginBottom: '8px' }}>
        <Input
          placeholder="搜索组件..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          size="small"
        />
      </div>

      {/* 组件列表 */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {Object.keys(filteredComponentsByCategory).length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#999', 
            padding: '20px',
            fontSize: '14px'
          }}>
            未找到匹配的组件
          </div>
        ) : (
          <Collapse 
            defaultActiveKey={Object.keys(filteredComponentsByCategory)}
            activeKey={searchText ? Object.keys(filteredComponentsByCategory) : undefined}
            ghost
            size="small"
            items={collapseItems}
          />
        )}
      </div>
    </div>
  )
}

export default ComponentPanel