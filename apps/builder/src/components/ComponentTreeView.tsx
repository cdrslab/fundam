import React from 'react'
import { Tree, Card, Typography, Space, Button } from 'antd'
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  DeleteOutlined,
  AppstoreOutlined
} from '@ant-design/icons'
import type { DataNode } from 'antd/es/tree'

import type { ComponentConfig } from '../types'
import { componentDefinitions } from '../config/components'

const { Title } = Typography

interface ComponentTreeViewProps {
  components: ComponentConfig[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onDelete: (id: string) => void
}

const ComponentTreeView: React.FC<ComponentTreeViewProps> = ({
  components,
  selectedId,
  onSelect,
  onDelete
}) => {
  // 构建树形结构
  const buildTreeData = (components: ComponentConfig[]): DataNode[] => {
    const componentMap = new Map(components.map(comp => [comp.id, comp]))
    const rootComponents = components.filter(comp => !comp.parentId)

    const buildNode = (component: ComponentConfig): DataNode => {
      const componentDef = componentDefinitions.find(def => def.type === component.type)
      const children = components.filter(comp => comp.parentId === component.id)

      return {
        key: component.id,
        title: (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '2px 0'
          }}>
            <Space size="small">
              <span style={{ fontSize: '12px' }}>
                {componentDef?.name || component.type}
              </span>
              <span style={{ color: '#999', fontSize: '10px' }}>
                ({component.id.slice(-6)})
              </span>
            </Space>
            <Space size="small">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(component.id)
                }}
                style={{ fontSize: '10px', padding: '0 4px', height: '20px' }}
              />
            </Space>
          </div>
        ),
        children: children.length > 0 ? children.map(buildNode) : undefined,
        isLeaf: children.length === 0
      }
    }

    return rootComponents.map(buildNode)
  }

  const treeData = buildTreeData(components)

  const handleSelect = (selectedKeys: React.Key[]) => {
    const key = selectedKeys[0]
    onSelect(key ? String(key) : null)
  }

  return (
    <Card
      title={
        <Space>
          <AppstoreOutlined />
          <Title level={5} style={{ margin: 0 }}>组件树</Title>
        </Space>
      }
      size="small"
      style={{ height: '100%' }}
      bodyStyle={{ padding: '8px' }}
    >
      {treeData.length > 0 ? (
        <Tree
          treeData={treeData}
          selectedKeys={selectedId ? [selectedId] : []}
          onSelect={handleSelect}
          showLine={{ showLeafIcon: false }}
          blockNode
          style={{ fontSize: '12px' }}
        />
      ) : (
        <div style={{
          textAlign: 'center',
          color: '#999',
          padding: '20px',
          fontSize: '12px'
        }}>
          暂无组件
        </div>
      )}
    </Card>
  )
}

export default ComponentTreeView
