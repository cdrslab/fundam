import React, { useState } from 'react'
import { Tabs } from 'antd'
import { AppstoreOutlined, MessageOutlined } from '@ant-design/icons'

import ComponentPanel from './ComponentPanel'
import AIChat from './AIChat'

const { TabPane } = Tabs

interface SidebarProps {
  onAddComponent: (componentType: string, defaultProps: Record<string, any>) => void
}

const Sidebar: React.FC<SidebarProps> = ({ onAddComponent }) => {
  const [activeTab, setActiveTab] = useState('components')

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        centered
        size="small"
        style={{ borderBottom: '1px solid #e8e8e8' }}
      >
        <TabPane
          tab={
            <span>
              <AppstoreOutlined />
              组件库
            </span>
          }
          key="components"
        />
        <TabPane
          tab={
            <span>
              <MessageOutlined />
              AI助手
            </span>
          }
          key="ai"
        />
      </Tabs>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 'components' && (
          <ComponentPanel onAddComponent={onAddComponent} />
        )}
        {activeTab === 'ai' && (
          <AIChat onGenerateComponent={onAddComponent} />
        )}
      </div>
    </div>
  )
}

export default Sidebar