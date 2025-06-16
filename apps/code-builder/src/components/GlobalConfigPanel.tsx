import React, { useState } from 'react'
import {
  Modal,
  Tabs,
  Form,
  Input,
  Select,
  Button,
  Space,
  Card,
  Typography,
  List,
  Popconfirm,
  message,
  Divider,
  Tag,
  Alert
} from 'antd'
import {
  ApiOutlined,
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  GlobalOutlined
} from '@ant-design/icons'
import type { GlobalConfig, ApiConfig, VariableConfig } from '../types'
import useCodeBuilderStore from '../store'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

interface GlobalConfigPanelProps {
  visible: boolean
  onClose: () => void
}

const GlobalConfigPanel: React.FC<GlobalConfigPanelProps> = ({
  visible,
  onClose
}) => {
  const { globalConfig, updateGlobalConfig } = useCodeBuilderStore()
  const [activeTab, setActiveTab] = useState('apis')
  const [apiForm] = Form.useForm()
  const [variableForm] = Form.useForm()
  const [editingApi, setEditingApi] = useState<string | null>(null)
  const [editingVariable, setEditingVariable] = useState<string | null>(null)

  // API管理
  const handleAddApi = (values: any) => {
    const apiKey = values.key
    const apiConfig: ApiConfig = {
      url: values.url,
      method: values.method,
      description: values.description,
      params: values.params ? JSON.parse(values.params) : {},
      headers: values.headers ? JSON.parse(values.headers) : {}
    }

    updateGlobalConfig({
      apis: {
        ...globalConfig.apis,
        [apiKey]: apiConfig
      }
    })

    apiForm.resetFields()
    setEditingApi(null)
    message.success('API接口已保存')
  }

  const handleDeleteApi = (apiKey: string) => {
    const newApis = { ...globalConfig.apis }
    delete newApis[apiKey]

    updateGlobalConfig({ apis: newApis })
    message.success('API接口已删除')
  }

  const handleEditApi = (apiKey: string) => {
    const api = globalConfig.apis[apiKey]
    apiForm.setFieldsValue({
      key: apiKey,
      url: api.url,
      method: api.method,
      description: api.description,
      params: api.params ? JSON.stringify(api.params, null, 2) : '',
      headers: api.headers ? JSON.stringify(api.headers, null, 2) : ''
    })
    setEditingApi(apiKey)
  }

  // 变量管理
  const handleAddVariable = (values: any) => {
    const varKey = values.key
    const varConfig: VariableConfig = {
      name: varKey,
      type: values.type,
      defaultValue: values.defaultValue,
      description: values.description
    }

    updateGlobalConfig({
      variables: {
        ...globalConfig.variables,
        [varKey]: varConfig
      }
    })

    variableForm.resetFields()
    setEditingVariable(null)
    message.success('全局变量已保存')
  }

  const handleDeleteVariable = (varKey: string) => {
    const newVariables = { ...globalConfig.variables }
    delete newVariables[varKey]

    updateGlobalConfig({ variables: newVariables })
    message.success('全局变量已删除')
  }

  const handleEditVariable = (varKey: string) => {
    const variable = globalConfig.variables[varKey]
    variableForm.setFieldsValue({
      key: varKey,
      type: variable.type,
      defaultValue: variable.defaultValue,
      description: variable.description
    })
    setEditingVariable(varKey)
  }

  // 路由参数管理
  const handleUpdateRouteParams = (params: string[]) => {
    updateGlobalConfig({ routeParams: params })
    message.success('路由参数已更新')
  }

  const handleUpdateQueryParams = (params: string[]) => {
    updateGlobalConfig({ queryParams: params })
    message.success('查询参数已更新')
  }

  const tabItems = [
    {
      key: 'apis',
      label: (
        <Space>
          <ApiOutlined />
          API接口管理
        </Space>
      ),
      children: (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Alert
              message="API接口配置"
              description="管理全局API接口，AI将根据组件功能自动关联对应的接口"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Card title="添加/编辑 API接口" size="small">
              <Form
                form={apiForm}
                layout="vertical"
                onFinish={handleAddApi}
              >
                <Form.Item
                  name="key"
                  label="接口标识"
                  rules={[{ required: true, message: '请输入接口标识' }]}
                >
                  <Input placeholder="如: userList, userAdd, userEdit" />
                </Form.Item>

                <Form.Item
                  name="url"
                  label="接口地址"
                  rules={[{ required: true, message: '请输入接口地址' }]}
                >
                  <Input placeholder="/api/user/list" />
                </Form.Item>

                <Form.Item
                  name="method"
                  label="请求方法"
                  rules={[{ required: true, message: '请选择请求方法' }]}
                >
                  <Select placeholder="请选择">
                    <Option value="GET">GET</Option>
                    <Option value="POST">POST</Option>
                    <Option value="PUT">PUT</Option>
                    <Option value="DELETE">DELETE</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="description"
                  label="接口描述"
                >
                  <Input placeholder="接口功能说明" />
                </Form.Item>

                <Form.Item
                  name="params"
                  label="默认参数 (JSON)"
                >
                  <TextArea
                    placeholder='{"pageSize": 10, "current": 1}'
                    autoSize={{ minRows: 2, maxRows: 4 }}
                  />
                </Form.Item>

                <Form.Item
                  name="headers"
                  label="请求头 (JSON)"
                >
                  <TextArea
                    placeholder='{"Content-Type": "application/json"}'
                    autoSize={{ minRows: 2, maxRows: 4 }}
                  />
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit">
                      {editingApi ? '更新' : '添加'}
                    </Button>
                    {editingApi && (
                      <Button onClick={() => {
                        setEditingApi(null)
                        apiForm.resetFields()
                      }}>
                        取消
                      </Button>
                    )}
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </div>

          <Card title="已配置的API接口" size="small">
            <List
              dataSource={Object.entries(globalConfig.apis)}
              renderItem={([key, api]) => (
                <List.Item
                  actions={[
                    <Button
                      key="edit"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => handleEditApi(key)}
                    />,
                    <Button
                      key="copy"
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() => {
                        navigator.clipboard.writeText(api.url)
                        message.success('接口地址已复制')
                      }}
                    />,
                    <Popconfirm
                      key="delete"
                      title="确认删除这个API接口？"
                      onConfirm={() => handleDeleteApi(key)}
                    >
                      <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                      />
                    </Popconfirm>
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>{key}</Text>
                        <Tag color={
                          api.method === 'GET' ? 'green' :
                          api.method === 'POST' ? 'blue' :
                          api.method === 'PUT' ? 'orange' : 'red'
                        }>
                          {api.method}
                        </Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <div>{api.url}</div>
                        {api.description && (
                          <div style={{ color: '#666', fontSize: '12px', marginTop: 4 }}>
                            {api.description}
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
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
        <div>
          <div style={{ marginBottom: 16 }}>
            <Alert
              message="全局变量配置"
              description="管理页面级别的状态变量，这些变量会在代码模板中自动生成"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Card title="添加/编辑 全局变量" size="small">
              <Form
                form={variableForm}
                layout="vertical"
                onFinish={handleAddVariable}
              >
                <Form.Item
                  name="key"
                  label="变量名"
                  rules={[{ required: true, message: '请输入变量名' }]}
                >
                  <Input placeholder="如: loading, dataSource, currentUser" />
                </Form.Item>

                <Form.Item
                  name="type"
                  label="变量类型"
                  rules={[{ required: true, message: '请选择变量类型' }]}
                >
                  <Select placeholder="请选择">
                    <Option value="state">State (useState)</Option>
                    <Option value="ref">Ref (useRef)</Option>
                    <Option value="computed">Computed (useMemo)</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="defaultValue"
                  label="默认值"
                >
                  <Input placeholder="变量的初始值" />
                </Form.Item>

                <Form.Item
                  name="description"
                  label="变量描述"
                >
                  <Input placeholder="变量的用途说明" />
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit">
                      {editingVariable ? '更新' : '添加'}
                    </Button>
                    {editingVariable && (
                      <Button onClick={() => {
                        setEditingVariable(null)
                        variableForm.resetFields()
                      }}>
                        取消
                      </Button>
                    )}
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </div>

          <Card title="已配置的全局变量" size="small">
            <List
              dataSource={Object.entries(globalConfig.variables)}
              renderItem={([key, variable]) => (
                <List.Item
                  actions={[
                    <Button
                      key="edit"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => handleEditVariable(key)}
                    />,
                    <Popconfirm
                      key="delete"
                      title="确认删除这个全局变量？"
                      onConfirm={() => handleDeleteVariable(key)}
                    >
                      <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                      />
                    </Popconfirm>
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>{key}</Text>
                        <Tag color="blue">{variable.type}</Tag>
                      </Space>
                    }
                    description={
                      <div>
                        {variable.description && (
                          <div style={{ marginBottom: 4 }}>{variable.description}</div>
                        )}
                        {variable.defaultValue !== undefined && (
                          <div style={{ color: '#666', fontSize: '12px' }}>
                            默认值: {JSON.stringify(variable.defaultValue)}
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </div>
      )
    },
    {
      key: 'routing',
      label: (
        <Space>
          <GlobalOutlined />
          路由配置
        </Space>
      ),
      children: (
        <div>
          <Alert
            message="路由参数配置"
            description="配置页面的路由参数和查询参数，这些参数会在代码模板中自动获取"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card title="路由参数 (Route Params)" size="small">
              <div style={{ marginBottom: 12 }}>
                <Text type="secondary">
                  如 /user/:id 中的 id 参数
                </Text>
              </div>
              <Select
                mode="tags"
                style={{ width: '100%' }}
                placeholder="输入路由参数名，如: id, userId"
                value={globalConfig.routeParams}
                onChange={handleUpdateRouteParams}
              />
              <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                代码中会生成: const {`{${globalConfig.routeParams.join(', ')}}`} = useParams()
              </div>
            </Card>

            <Card title="查询参数 (Query Params)" size="small">
              <div style={{ marginBottom: 12 }}>
                <Text type="secondary">
                  如 /user?tab=info&status=active 中的 tab 和 status 参数
                </Text>
              </div>
              <Select
                mode="tags"
                style={{ width: '100%' }}
                placeholder="输入查询参数名，如: tab, status, page"
                value={globalConfig.queryParams}
                onChange={handleUpdateQueryParams}
              />
              <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                代码中会生成: const [searchParams] = useSearchParams()
              </div>
            </Card>
          </Space>
        </div>
      )
    }
  ]

  return (
    <Modal
      title={
        <Space>
          <SettingOutlined />
          全局配置管理
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={800}
      footer={
        <Space>
          <Button onClick={onClose}>关闭</Button>
          <Button type="primary" onClick={() => {
            message.success('配置已保存')
            onClose()
          }}>
            保存配置
          </Button>
        </Space>
      }
      destroyOnClose
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        style={{ minHeight: '500px' }}
      />
    </Modal>
  )
}

export default GlobalConfigPanel
