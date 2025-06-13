import React, { useState, useEffect } from 'react'
import {
  Modal,
  Form,
  Select,
  Input,
  Slider,
  InputNumber,
  Typography,
  Card,
  Space,
  Button,
  Alert,
  Divider
} from 'antd'
import { SettingOutlined, KeyOutlined, RobotOutlined } from '@ant-design/icons'
import { aiConfigManager, AIConfig, AIProvider } from '../store/aiConfig'

const { Title, Text } = Typography
const { Password } = Input

interface AIConfigModalProps {
  visible: boolean
  onCancel: () => void
  onOk?: () => void
}

const AIConfigModal: React.FC<AIConfigModalProps> = ({
  visible,
  onCancel,
  onOk
}) => {
  const [form] = Form.useForm()
  const [config, setConfig] = useState<AIConfig>(aiConfigManager.getConfig())
  const [testLoading, setTestLoading] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    if (visible) {
      const currentConfig = aiConfigManager.getConfig()
      setConfig(currentConfig)
      form.setFieldsValue({
        currentProvider: currentConfig.currentProvider,
        currentModel: currentConfig.currentModel,
        temperature: currentConfig.temperature,
        maxTokens: currentConfig.maxTokens,
        ...currentConfig.apiKeys
      })
    }
  }, [visible, form])

  const handleProviderChange = (providerId: string) => {
    const provider = config.providers.find(p => p.id === providerId)
    if (provider) {
      const newModel = provider.models[0]
      setConfig(prev => ({
        ...prev,
        currentProvider: providerId,
        currentModel: newModel
      }))
      form.setFieldValue('currentModel', newModel)
    }
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      const { currentProvider, currentModel, temperature, maxTokens, ...apiKeys } = values

      // 更新配置
      aiConfigManager.updateConfig({
        currentProvider,
        currentModel,
        temperature,
        maxTokens
      })

      // 更新API Keys
      Object.keys(apiKeys).forEach(provider => {
        if (apiKeys[provider]) {
          aiConfigManager.setApiKey(provider, apiKeys[provider])
        }
      })

      setTestResult(null)
      onOk?.()
      onCancel()
    } catch (error) {
      console.error('保存配置失败:', error)
    }
  }

  const handleTest = async () => {
    setTestLoading(true)
    setTestResult(null)

    try {
      const values = await form.validateFields()
      const { currentProvider } = values
      const apiKey = values[currentProvider]

      if (!apiKey) {
        setTestResult({
          success: false,
          message: '请先输入API Key'
        })
        return
      }

      // 临时更新配置进行测试
      const tempConfig = { ...config }
      aiConfigManager.setApiKey(currentProvider, apiKey)

      // 发送测试请求
      const { aiService } = await import('../services/aiService')
      const response = await aiService.chat([{
        id: 'test',
        role: 'user',
        content: '你好，请回复"测试成功"',
        timestamp: Date.now()
      }])

      setTestResult({
        success: response.success,
        message: response.success ? '连接测试成功！' : (response.error || '测试失败')
      })
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : '测试失败'
      })
    } finally {
      setTestLoading(false)
    }
  }

  const getCurrentProvider = (): AIProvider | null => {
    return config.providers.find(p => p.id === config.currentProvider) || null
  }

  const currentProvider = getCurrentProvider()

  return (
    <Modal
      title={
        <Space>
          <RobotOutlined />
          AI助手配置
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      onOk={handleSave}
      width={600}
      okText="保存配置"
      cancelText="取消"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={config}
      >
        <Card title={<Space><SettingOutlined />基础配置</Space>} size="small" style={{ marginBottom: 16 }}>
          <Form.Item
            name="currentProvider"
            label="AI服务提供商"
            rules={[{ required: true, message: '请选择AI服务提供商' }]}
          >
            <Select onChange={handleProviderChange}>
              {config.providers.map(provider => (
                <Select.Option key={provider.id} value={provider.id}>
                  {provider.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="currentModel"
            label="AI模型"
            rules={[{ required: true, message: '请选择AI模型' }]}
          >
            <Select>
              {currentProvider?.models.map(model => (
                <Select.Option key={model} value={model}>
                  {model}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="temperature"
            label={`创造性 (${config.temperature})`}
            help="控制回复的随机性，0-1之间，越高越有创造性"
          >
            <Slider
              min={0}
              max={1}
              step={0.1}
              value={config.temperature}
              onChange={(value) => setConfig(prev => ({ ...prev, temperature: value }))}
            />
          </Form.Item>

          <Form.Item
            name="maxTokens"
            label="最大回复长度"
            help="限制AI回复的最大字数"
          >
            <InputNumber
              min={100}
              max={4000}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Card>

        <Card title={<Space><KeyOutlined />API密钥配置</Space>} size="small">
          {config.providers.map(provider => (
            <Form.Item
              key={provider.id}
              name={provider.id}
              label={`${provider.name} API Key`}
              help={provider.id === 'openai' 
                ? '在 https://platform.openai.com/api-keys 获取' 
                : '在 https://platform.deepseek.com/api_keys 获取'}
            >
              <Password 
                placeholder={`请输入${provider.name} API Key`}
                autoComplete="off"
              />
            </Form.Item>
          ))}

          <Divider />

          <Space>
            <Button 
              type="primary" 
              ghost 
              loading={testLoading}
              onClick={handleTest}
              disabled={!currentProvider}
            >
              测试连接
            </Button>
            {testResult && (
              <Alert
                message={testResult.message}
                type={testResult.success ? 'success' : 'error'}
                showIcon
                style={{ flex: 1 }}
              />
            )}
          </Space>
        </Card>

        <Alert
          message="提示"
          description="API Key只会保存在浏览器本地，不会上传到服务器。请确保API Key的安全性。"
          type="info"
          showIcon
          style={{ marginTop: 16 }}
        />
      </Form>
    </Modal>
  )
}

export default AIConfigModal