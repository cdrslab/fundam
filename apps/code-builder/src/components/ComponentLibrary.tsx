import React from 'react'
import { Collapse, Typography, Space, Avatar } from 'antd'
import {
  TableOutlined,
  FormOutlined,
  BorderOutlined,
  AppstoreOutlined,
  SearchOutlined,
  SelectOutlined,
  EditOutlined,
  CreditCardOutlined,
  TabletOutlined,
  LayoutOutlined,
  FileTextOutlined
} from '@ant-design/icons'
import type { ComponentConfig } from '../types'

const { Text } = Typography
const { Panel } = Collapse

interface ComponentLibraryProps {
  onDragStart?: (componentType: string) => void
}

interface LibraryComponent {
  type: string
  name: string
  description: string
  icon: React.ReactNode
  category: string
  props?: Record<string, any>
}

const COMPONENT_LIBRARY: LibraryComponent[] = [
  // 数据展示组件
  {
    type: 'PageListQuery',
    name: '列表查询页面',
    description: '包含搜索表单和数据表格的完整查询页面',
    icon: <TableOutlined />,
    category: 'data',
    props: {
      searchForm: true,
      pagination: true,
      rowSelection: true
    }
  },
  {
    type: 'ProTable',
    name: '高级表格',
    description: '功能丰富的数据表格组件',
    icon: <TableOutlined />,
    category: 'data',
    props: {
      rowKey: 'id',
      pagination: { pageSize: 10 }
    }
  },
  
  // 表单组件
  {
    type: 'Form',
    name: '表单',
    description: '数据收集和验证表单',
    icon: <FormOutlined />,
    category: 'form',
    props: {
      layout: 'vertical',
      validateTrigger: 'onBlur'
    }
  },
  {
    type: 'ModalForm',
    name: '弹窗表单',
    description: '在弹窗中显示的表单',
    icon: <FileTextOutlined />,
    category: 'form',
    props: {
      title: '表单',
      width: 600
    }
  },
  {
    type: 'FormItemInput',
    name: '输入框',
    description: '文本输入框表单项',
    icon: <EditOutlined />,
    category: 'form',
    props: {
      label: '输入框',
      placeholder: '请输入'
    }
  },
  {
    type: 'FormItemSelect',
    name: '下拉选择',
    description: '下拉选择框表单项',
    icon: <SelectOutlined />,
    category: 'form',
    props: {
      label: '下拉选择',
      placeholder: '请选择'
    }
  },
  
  // 操作组件
  {
    type: 'Button',
    name: '按钮',
    description: '触发操作的按钮',
    icon: <BorderOutlined />,
    category: 'action',
    props: {
      type: 'primary',
      children: '按钮'
    }
  },
  
  // 布局组件
  {
    type: 'Card',
    name: '卡片',
    description: '信息展示卡片容器',
    icon: <CreditCardOutlined />,
    category: 'layout',
    props: {
      title: '卡片标题',
      bordered: true
    }
  },
  {
    type: 'Tabs',
    name: '标签页',
    description: '内容分类展示的标签页',
    icon: <TabletOutlined />,
    category: 'layout',
    props: {
      type: 'card'
    }
  }
]

const CATEGORY_CONFIG = {
  data: {
    title: '数据展示',
    icon: <TableOutlined />,
    description: '表格、列表等数据展示组件'
  },
  form: {
    title: '表单输入',
    icon: <FormOutlined />,
    description: '表单、输入框等数据收集组件'
  },
  action: {
    title: '操作反馈',
    icon: <BorderOutlined />,
    description: '按钮、操作等交互组件'
  },
  layout: {
    title: '布局导航',
    icon: <LayoutOutlined />,
    description: '卡片、标签页等布局组件'
  }
}

const ComponentLibrary: React.FC<ComponentLibraryProps> = ({ onDragStart }) => {
  const handleDragStart = (e: React.DragEvent, component: LibraryComponent) => {
    // 设置拖拽数据
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: component.type,
      name: component.name,
      props: component.props || {}
    }))
    e.dataTransfer.effectAllowed = 'copy'
    
    onDragStart?.(component.type)
  }

  const groupedComponents = Object.keys(CATEGORY_CONFIG).map(categoryKey => ({
    key: categoryKey,
    config: CATEGORY_CONFIG[categoryKey as keyof typeof CATEGORY_CONFIG],
    components: COMPONENT_LIBRARY.filter(comp => comp.category === categoryKey)
  }))

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      <div style={{
        padding: '16px 16px 8px',
        borderBottom: '1px solid #e8e8e8',
        background: '#fafafa'
      }}>
        <Text strong>组件库</Text>
        <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
          拖拽组件到画布中使用
        </div>
      </div>

      <div style={{ padding: '8px' }}>
        <Collapse
          ghost
          defaultActiveKey={['data', 'form']}
          expandIconPosition="end"
        >
          {groupedComponents.map(group => (
            <Panel
              key={group.key}
              header={
                <Space>
                  {group.config.icon}
                  <span style={{ fontWeight: 500 }}>{group.config.title}</span>
                  <span style={{ fontSize: '11px', color: '#999' }}>
                    ({group.components.length})
                  </span>
                </Space>
              }
            >
              <div style={{ marginLeft: -16, marginRight: -16 }}>
                {group.components.map(component => (
                  <ComponentLibraryItem
                    key={component.type}
                    component={component}
                    onDragStart={handleDragStart}
                  />
                ))}
              </div>
            </Panel>
          ))}
        </Collapse>
      </div>
    </div>
  )
}

interface ComponentLibraryItemProps {
  component: LibraryComponent
  onDragStart: (e: React.DragEvent, component: LibraryComponent) => void
}

const ComponentLibraryItem: React.FC<ComponentLibraryItemProps> = ({
  component,
  onDragStart
}) => {
  return (
    <div
      draggable
      style={{
        padding: '12px 16px',
        margin: '4px 0',
        border: '1px solid #e8e8e8',
        borderRadius: '6px',
        background: '#fff',
        cursor: 'grab',
        transition: 'all 0.2s',
        userSelect: 'none'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#1890ff'
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(24, 144, 255, 0.2)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e8e8e8'
        e.currentTarget.style.boxShadow = 'none'
      }}
      onDragStart={(e) => {
        onDragStart(e, component)
        // 添加拖拽效果
        e.currentTarget.style.opacity = '0.7'
        e.currentTarget.style.transform = 'rotate(5deg)'
      }}
      onDragEnd={(e) => {
        // 恢复样式
        e.currentTarget.style.opacity = '1'
        e.currentTarget.style.transform = 'rotate(0deg)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <Avatar
          size={32}
          icon={component.icon}
          style={{
            background: '#f0f7ff',
            color: '#1890ff',
            flexShrink: 0
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '13px',
            fontWeight: 500,
            marginBottom: 4,
            color: '#262626'
          }}>
            {component.name}
          </div>
          <div style={{
            fontSize: '11px',
            color: '#8c8c8c',
            lineHeight: 1.4
          }}>
            {component.description}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComponentLibrary