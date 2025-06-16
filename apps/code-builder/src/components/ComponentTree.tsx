import React from 'react'
import { Tree, Typography, Space, Button, Tooltip, Input, Tabs } from 'antd'
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  DeleteOutlined,
  ApiOutlined,
  SettingOutlined, AppstoreOutlined
} from '@ant-design/icons'
import type { TreeDataNode } from 'antd'
import useCodeBuilderStore from '../store'
import type { ComponentConfig } from '../types'

const { Title } = Typography
const { Search } = Input

interface ComponentTreeProps {}

const ComponentTree: React.FC<ComponentTreeProps> = () => {
  const {
    components,
    componentSelector,
    selectComponent,
    setComponentVisibility,
    expandComponent,
    collapseComponent,
    globalConfig
  } = useCodeBuilderStore()

  const [searchValue, setSearchValue] = React.useState('')
  const [activeTab, setActiveTab] = React.useState('components')

  // 构建组件树数据
  const buildTreeData = (components: ComponentConfig[]): TreeDataNode[] => {
    const componentMap = new Map<string, ComponentConfig>()
    const rootComponents: ComponentConfig[] = []

    // 建立组件映射
    components.forEach(comp => {
      componentMap.set(comp.identity.id, comp)
    })

    // 找出根组件
    components.forEach(comp => {
      if (!comp.identity.parentId || !componentMap.has(comp.identity.parentId)) {
        rootComponents.push(comp)
      }
    })

    // 递归构建树节点
    const buildNode = (component: ComponentConfig): TreeDataNode => {
      const children = components.filter(comp => comp.identity.parentId === component.identity.id)

      return {
        key: component.identity.id,
        title: (
          <ComponentTreeNode
            component={component}
            onToggleVisibility={(visible) => setComponentVisibility(component.identity.id, visible)}
            onDelete={() => {
              // TODO: 实现删除功能
              console.log('删除组件:', component.identity.id)
            }}
          />
        ),
        children: children.map(buildNode),
        className: `component-tree-node ${
          component.identity.id === componentSelector.selectedId ? 'selected' : ''
        } ${!component.isVisible ? 'hidden' : ''}`
      }
    }

    return rootComponents.map(buildNode)
  }

  // 过滤搜索结果
  const filterTreeData = (treeData: TreeDataNode[], searchValue: string): TreeDataNode[] => {
    if (!searchValue) return treeData

    const filter = (nodes: TreeDataNode[]): TreeDataNode[] => {
      return nodes.reduce((acc, node) => {
        const component = components.find(comp => comp.identity.id === node.key)
        const matchesSearch = component?.identity.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                            component?.identity.type.toLowerCase().includes(searchValue.toLowerCase())

        if (matchesSearch) {
          acc.push(node)
        } else if (node.children) {
          const filteredChildren = filter(node.children)
          if (filteredChildren.length > 0) {
            acc.push({
              ...node,
              children: filteredChildren
            })
          }
        }

        return acc
      }, [] as TreeDataNode[])
    }

    return filter(treeData)
  }

  const treeData = filterTreeData(buildTreeData(components), searchValue)

  // 构建API列表
  const buildApiList = () => {
    return Object.entries(globalConfig.apis).map(([key, api]) => ({
      key,
      label: api.description || key,
      url: api.url,
      method: api.method
    }))
  }

  // 构建变量列表
  const buildVariableList = () => {
    return Object.entries(globalConfig.variables).map(([key, variable]) => ({
      key,
      label: variable.description || key,
      type: variable.type,
      defaultValue: variable.defaultValue
    }))
  }

  const tabItems = [
    {
      key: 'components',
      label: (
        <Space>
          <AppstoreOutlined />
          组件树
        </Space>
      ),
      children: (
        <div style={{ padding: '16px 0' }}>
          <div style={{ marginBottom: 16 }}>
            <Search
              placeholder="搜索组件..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              style={{ marginBottom: 8 }}
            />
          </div>

          {components.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: '#999',
              padding: '40px 20px',
              background: '#fafafa',
              borderRadius: '6px',
              border: '1px dashed #d9d9d9'
            }}>
              <div>暂无组件</div>
              <div style={{ fontSize: '12px', marginTop: 4 }}>
                开始编写代码或使用AI生成组件
              </div>
            </div>
          ) : (
            <Tree
              treeData={treeData}
              selectedKeys={componentSelector.selectedId ? [componentSelector.selectedId] : []}
              expandedKeys={componentSelector.expandedIds}
              onSelect={(selectedKeys) => {
                const selectedId = selectedKeys[0] as string || null
                selectComponent(selectedId)
              }}
              onExpand={(expandedKeys) => {
                // 更新展开状态
                expandedKeys.forEach(key => {
                  if (!componentSelector.expandedIds.includes(key as string)) {
                    expandComponent(key as string)
                  }
                })

                componentSelector.expandedIds.forEach(key => {
                  if (!expandedKeys.includes(key)) {
                    collapseComponent(key)
                  }
                })
              }}
              showLine={{ showLeafIcon: false }}
              blockNode
            />
          )}
        </div>
      )
    },
    {
      key: 'apis',
      label: (
        <Space>
          <ApiOutlined />
          API接口
        </Space>
      ),
      children: (
        <div style={{ padding: '16px 0' }}>
          <div style={{ marginBottom: 16 }}>
            <Button type="primary" size="small" block>
              新增API接口
            </Button>
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {buildApiList().map(api => (
              <div
                key={api.key}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #e8e8e8',
                  borderRadius: '4px',
                  marginBottom: '8px',
                  fontSize: '12px'
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  {api.label}
                </div>
                <div style={{ color: '#666' }}>
                  <span style={{
                    background: api.method === 'GET' ? '#52c41a' :
                              api.method === 'POST' ? '#1890ff' :
                              api.method === 'PUT' ? '#faad14' : '#f5222d',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '2px',
                    fontSize: '10px',
                    marginRight: '8px'
                  }}>
                    {api.method}
                  </span>
                  {api.url}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      key: 'variables',
      label: (
        <Space>
          <SettingOutlined />
          全局变量
        </Space>
      ),
      children: (
        <div style={{ padding: '16px 0' }}>
          <div style={{ marginBottom: 16 }}>
            <Button type="primary" size="small" block>
              新增变量
            </Button>
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {buildVariableList().map(variable => (
              <div
                key={variable.key}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #e8e8e8',
                  borderRadius: '4px',
                  marginBottom: '8px',
                  fontSize: '12px'
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  {variable.label}
                </div>
                <div style={{ color: '#666' }}>
                  <span style={{ marginRight: '8px' }}>
                    {variable.type}
                  </span>
                  {variable.defaultValue !== undefined && (
                    <span>
                      默认值: {JSON.stringify(variable.defaultValue)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }
  ]

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '16px 16px 0',
        borderBottom: '1px solid #e8e8e8',
        background: '#fafafa'
      }}>
        <Title level={5} style={{ margin: 0 }}>
          项目结构
        </Title>
      </div>

      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size="small"
          items={tabItems}
          style={{ height: '100%' }}
          tabBarStyle={{ margin: '0 16px', paddingTop: '8px' }}
        />
      </div>
    </div>
  )
}

// 组件树节点组件
interface ComponentTreeNodeProps {
  component: ComponentConfig
  onToggleVisibility: (visible: boolean) => void
  onDelete: () => void
}

const ComponentTreeNode: React.FC<ComponentTreeNodeProps> = ({
  component,
  onToggleVisibility,
  onDelete
}) => {
  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleVisibility(!component.isVisible)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete()
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%'
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500, fontSize: '13px' }}>
          {component.identity.name}
        </div>
        <div style={{ fontSize: '11px', color: '#999' }}>
          {component.identity.type} · {component.identity.id.slice(-8)}
        </div>
      </div>

      <Space size={4}>
        <Tooltip title={component.isVisible ? '隐藏组件' : '显示组件'}>
          <Button
            type="text"
            size="small"
            icon={component.isVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            onClick={handleToggleVisibility}
            style={{
              color: component.isVisible ? '#52c41a' : '#ff4d4f',
              padding: '2px 4px'
            }}
          />
        </Tooltip>

        <Tooltip title="删除组件">
          <Button
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            onClick={handleDelete}
            style={{ color: '#ff4d4f', padding: '2px 4px' }}
          />
        </Tooltip>
      </Space>
    </div>
  )
}

export default ComponentTree
