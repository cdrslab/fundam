import React, { useState } from 'react'
import { Tabs } from 'antd'
import { AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons'

import ComponentPanel from './ComponentPanel'
import ComponentTreeView from './ComponentTreeView'
import { ComponentConfig } from '../types'

interface SidebarProps {
  onAddComponent: (componentType: string, defaultProps: Record<string, any>) => void
  components: ComponentConfig[]
  selectedId: string | null
  onSelectComponent: (id: string | null) => void
  onDeleteComponent: (id: string) => void
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onAddComponent, 
  components, 
  selectedId, 
  onSelectComponent, 
  onDeleteComponent 
}) => {
  const [activeTab, setActiveTab] = useState('components')

  const tabItems = [
    {
      key: 'components',
      label: (
        <span>
          <AppstoreOutlined />
          组件库
        </span>
      ),
      children: <ComponentPanel onAddComponent={onAddComponent} />
    },
    {
      key: 'tree',
      label: (
        <span>
          <UnorderedListOutlined />
          组件树
        </span>
      ),
      children: (
        <ComponentTreeView
          components={components}
          selectedId={selectedId}
          onSelect={onSelectComponent}
          onDelete={onDeleteComponent}
        />
      )
    }
  ]

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        centered
        size="small"
        items={tabItems}
        style={{ 
          borderBottom: '1px solid #e8e8e8',
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}
        tabBarStyle={{ marginBottom: 0 }}
      />
    </div>
  )
}

export default Sidebar