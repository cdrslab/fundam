import React from 'react'
import { Modal, Form, Select, Input, Slider, Button, Space, message, Alert, Card, Typography } from 'antd'
import { 
  SettingOutlined, 
  KeyOutlined, 
  ThunderboltOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons'
import { aiConfigManager, AI_PROVIDERS, type AIConfig } from '../store/aiConfig'

const { Text, Title } = Typography
const { Option } = Select

interface AIConfigModalProps {
  visible: boolean
  onClose: () => void
}

const AIConfigModal: React.FC<AIConfigModalProps> = ({ visible, onClose }) => {
  const [form] = Form.useForm()
  const [config, setConfig] = React.useState<AIConfig>(aiConfigManager.getConfig())
  const [testing, setTesting] = React.useState(false)
  const [testResult, setTestResult] = React.useState<{ success: boolean; message: string } | null>(null)

  React.useEffect(() => {
    if (visible) {
      const currentConfig = aiConfigManager.getConfig()
      setConfig(currentConfig)
      form.setFieldsValue(currentConfig)
      setTestResult(null)
    }
  }, [visible, form])

  const handleProviderChange = (providerId: string) => {
    const provider = AI_PROVIDERS.find(p => p.id === providerId)
    if (!provider) return

    const newConfig = {
      ...config,
      currentProvider: providerId,
      currentModel: provider.models[0] || ''
    }
    setConfig(newConfig)
    form.setFieldsValue(newConfig)
  }

  const handleModelChange = (model: string) => {
    const newConfig = { ...config, currentModel: model }
    setConfig(newConfig)
  }

  const handleApiKeyChange = (providerId: string, apiKey: string) => {
    const newConfig = {
      ...config,
      apiKeys: { ...config.apiKeys, [providerId]: apiKey }
    }
    setConfig(newConfig)
  }

  const handleTestConnection = async () => {
    try {
      setTesting(true)
      setTestResult(null)
      
      // 先保存当前配置
      aiConfigManager.updateConfig(config)
      
      const result = await aiConfigManager.testConnection()
      setTestResult(result)
      
      if (result.success) {
        message.success('连接测试成功')
      } else {
        message.error(result.message)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '测试失败'
      setTestResult({ success: false, message: errorMessage })
      message.error(errorMessage)
    } finally {
      setTesting(false)
    }
  }

  const handleSave = () => {
    form.validateFields().then(() => {
      aiConfigManager.updateConfig(config)
      message.success('配置已保存')
      onClose()
    }).catch(() => {
      message.error('请检查配置是否正确')
    })
  }

  const currentProvider = AI_PROVIDERS.find(p => p.id === config.currentProvider)
  const isConfigured = aiConfigManager.isConfigured()

  return (
    <Modal
      title={
        <Space>
          <SettingOutlined />
          AI 服务配置
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button 
            type="primary" 
            onClick={handleTestConnection}
            loading={testing}
            disabled={!config.currentProvider || !config.apiKeys[config.currentProvider]}
          >
            <ThunderboltOutlined />
            测试连接
          </Button>
          <Button type="primary" onClick={handleSave}>
            保存配置
          </Button>
        </Space>
      }
      width={600}
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {/* 连接状态显示 */}
        {testResult && (
          <Alert
            message={testResult.success ? '连接成功' : '连接失败'}
            description={testResult.message}
            type={testResult.success ? 'success' : 'error'}
            icon={testResult.success ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            style={{ marginBottom: 16 }}
            closable
          />
        )}

        <Form
          form={form}
          layout="vertical"
          initialValues={config}
        >
          {/* AI提供商选择 */}
          <Card size="small" title="AI 提供商" style={{ marginBottom: 16 }}>
            <Form.Item
              label="选择提供商"
              name="currentProvider"
              rules={[{ required: true, message: '请选择AI提供商' }]}
            >
              <Select 
                value={config.currentProvider}
                onChange={handleProviderChange}
                placeholder="选择AI提供商"
              >
                {AI_PROVIDERS.map(provider => (
                  <Option key={provider.id} value={provider.id}>
                    <Space>
                      <span>{provider.name}</span>
                      {provider.requiresKey && <KeyOutlined style={{ color: '#faad14' }} />}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {currentProvider && (
              <Form.Item
                label="选择模型"
                name="currentModel"
                rules={[{ required: true, message: '请选择模型' }]}
              >
                <Select 
                  value={config.currentModel}
                  onChange={handleModelChange}
                  placeholder="选择模型"
                >
                  {currentProvider.models.map(model => (
                    <Option key={model} value={model}>
                      {model}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}
          </Card>

          {/* API Key配置 */}
          {currentProvider?.requiresKey && (
            <Card size="small" title="API 密钥" style={{ marginBottom: 16 }}>
              <Form.Item
                label={`${currentProvider.name} API Key`}
                name={['apiKeys', currentProvider.id]}
                rules={[{ required: true, message: 'API Key不能为空' }]}
              >
                <Input.Password
                  placeholder={`请输入${currentProvider.name} API Key`}
                  value={config.apiKeys[currentProvider.id] || ''}
                  onChange={(e) => handleApiKeyChange(currentProvider.id, e.target.value)}
                />
              </Form.Item>
              
              <Alert
                message="API Key 安全提示"
                description="API Key将保存在浏览器本地存储中，请确保设备安全。建议使用专门的API Key，并设置适当的使用限制。"
                type="info"
                showIcon
                style={{ fontSize: '12px' }}
              />
            </Card>
          )}

          {/* 参数配置 */}
          <Card size="small" title="生成参数">
            <Form.Item
              label={`温度 (Temperature): ${config.temperature}`}
              name="temperature"
            >
              <Slider
                min={0}
                max={2}
                step={0.1}
                value={config.temperature}
                onChange={(value) => setConfig({ ...config, temperature: value })}
                marks={{
                  0: '精确',
                  1: '平衡',
                  2: '创意'
                }}
              />
            </Form.Item>

            <Form.Item
              label={`最大Token数: ${config.maxTokens}`}
              name="maxTokens"
            >
              <Slider
                min={100}
                max={4000}
                step={100}
                value={config.maxTokens}
                onChange={(value) => setConfig({ ...config, maxTokens: value })}
                marks={{
                  100: '100',
                  2000: '2000',
                  4000: '4000'
                }}
              />
            </Form.Item>
          </Card>

          {/* 配置状态 */}
          <Card size="small" title="配置状态">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>当前状态:</Text>
              <Space>
                {isConfigured ? (
                  <Text type="success">
                    <CheckCircleOutlined /> 已配置
                  </Text>
                ) : (
                  <Text type="danger">
                    <CloseCircleOutlined /> 未配置
                  </Text>
                )}
              </Space>
            </div>
            
            {currentProvider && (
              <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                <div>提供商: {currentProvider.name}</div>
                <div>模型: {config.currentModel}</div>
                <div>API地址: {currentProvider.baseUrl}</div>
              </div>
            )}
          </Card>
        </Form>
      </div>
    </Modal>
  )
}

export default AIConfigModal