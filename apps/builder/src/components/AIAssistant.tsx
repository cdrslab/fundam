import React, { useState, useRef, useEffect } from 'react'
import {
  Card,
  Input,
  Button,
  List,
  Avatar,
  Typography,
  Space,
  Spin,
  Empty,
  Tooltip,
  Dropdown,
  MenuProps,
} from 'antd'
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  SettingOutlined,
  ClearOutlined,
  BulbOutlined,
  CodeOutlined
} from '@ant-design/icons'

import { ChatMessage } from '../types'
import { aiService, ChatResponse } from '../services/aiService'
import { aiConfigManager } from '../store/aiConfig'
import AIConfigModal from './AIConfigModal'
import { useCanvasComponents } from '../hooks/useCanvasComponents'

const { TextArea } = Input
const { Text, Paragraph } = Typography

interface AIAssistantProps {
  selectedComponent?: any
  onCodeGenerated?: (code: string) => void
}

const AIAssistant: React.FC<AIAssistantProps> = ({ selectedComponent, onCodeGenerated }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [configVisible, setConfigVisible] = useState(false)
  const [isConfigured, setIsConfigured] = useState(aiConfigManager.isConfigured())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const allComponents = useCanvasComponents()

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    setIsConfigured(aiConfigManager.isConfigured())
  }, [configVisible])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async () => {
    if (!input.trim() || loading || !isConfigured) return

    const prompt = input.trim()
    setInput('')
    
    // 使用新的上下文发送方法
    await handleSendWithContext(prompt)
  }

  const handleClear = () => {
    setMessages([])
  }

  const handleQuickAction = async (type: 'generate' | 'improve' | 'explain' | 'code') => {
    if (!isConfigured) {
      setConfigVisible(true)
      return
    }

    let prompt = ''
    let shouldSendDirectly = false

    switch (type) {
      case 'generate':
        prompt = '帮我设计一个用户管理页面，包含用户列表、搜索功能和新增编辑功能'
        break
      case 'improve':
        if (!selectedComponent) {
          prompt = '请分析当前页面布局，给出优化建议'
          shouldSendDirectly = true
        } else {
          prompt = `请分析这个${selectedComponent.type}组件，给出改进建议`
          shouldSendDirectly = true
        }
        break
      case 'explain':
        if (allComponents.length === 0) {
          prompt = '请介绍Fundam组件库的主要功能和使用方法'
        } else {
          prompt = `请解释当前页面的组件结构和功能：共有${allComponents.length}个组件`
          shouldSendDirectly = true
        }
        break
      case 'code':
        if (allComponents.length === 0) {
          prompt = '当前页面为空，无法生成代码'
        } else {
          prompt = '请将当前页面配置生成完整的React TypeScript代码'
          shouldSendDirectly = true
        }
        break
    }

    if (shouldSendDirectly) {
      await handleSendWithContext(prompt, type)
    } else {
      setInput(prompt)
    }
  }

  const handleSendWithContext = async (prompt: string, actionType?: string) => {
    if (!isConfigured) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    setLoading(true)

    try {
      let response: ChatResponse

      switch (actionType) {
        case 'generate':
          response = await aiService.generateComponent(prompt, allComponents)
          break
        case 'improve':
          response = await aiService.improveComponent(selectedComponent, prompt, allComponents)
          break
        case 'code':
          response = await aiService.generatePageCode(allComponents)
          break
        default:
          // 为普通对话添加内置prompt，强制使用Fundam组件
          const chatSystemPrompt = `你是Fundam组件库的智能助手。当用户描述UI需求时，你必须只使用Fundam组件生成TSX代码。

# 强制要求
当用户要求创建页面/组件时，必须使用以下格式：

\`\`\`tsx
const GeneratedPage: React.FC = () => {
  // 组件逻辑
  return (
    <div>
      {/* 组件JSX */}
    </div>
  )
}
\`\`\`

# 禁止事项
1. **禁止写import语句** - 所有组件都已预先导入
2. **禁止写export语句** - 组件会自动导出
3. **禁止写interface或type定义** - 只写组件代码
4. **禁止使用antd原生组件** - 必须使用Fundam组件
5. **禁止不完整的const声明** - 每个const必须有完整的初始化

# 必须使用的Fundam组件
- **PageListQuery**: 列表查询页面(最重要!)
- **Form**: Fundam表单(不是antd Form!)
- **FormItemInput**: 输入框(不是Input!)
- **FormItemSelect**: 下拉选择(不是Select!)
- **ProTable**: 增强表格(不是antd Table!)
- **Card**: Fundam卡片(不是antd Card!)
- **ModalForm**: 模态框表单

# 标准模式
用户要求列表页面时：
\`\`\`tsx
const GeneratedPage: React.FC = () => {
  const form = useAntFormInstance()
  
  return (
    <PageListQuery
      formItems={
        <>
          <FormItemInput name="name" label="姓名" />
          <FormItemSelect name="status" label="状态" />
        </>
      }
      tableProps={{
        columns: [
          { title: '姓名', dataIndex: 'name' },
          { title: '状态', dataIndex: 'status' }
        ],
        dataSource: mockData
      }}
    />
  )
}
\`\`\`

如果用户只是问问题，则正常回答。但一旦涉及页面/组件需求，必须使用Fundam组件。`
          response = await aiService.chat([...messages, userMessage], chatSystemPrompt)
          break
      }
      
      // 如果返回了代码且需要渲染，保存代码但不立即应用
      if (response.success && response.shouldRender && response.code) {
        // 代码已保存在response中，由消息显示处理
      }
      
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.success 
          ? response.message
          : `错误: ${response.error}`,
        timestamp: Date.now(),
        // 如果有代码，保存在消息中
        code: response.shouldRender && response.code ? response.code : undefined
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `发生错误: ${error instanceof Error ? error.message : '未知错误'}`,
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const menuItems: MenuProps['items'] = [
    {
      key: 'generate',
      label: '生成页面',
      icon: <BulbOutlined />,
      onClick: () => handleQuickAction('generate')
    },
    {
      key: 'improve',
      label: '优化建议',
      icon: <CodeOutlined />,
      onClick: () => handleQuickAction('improve')
    },
    {
      key: 'explain',
      label: '功能说明',
      icon: <RobotOutlined />,
      onClick: () => handleQuickAction('explain')
    },
    {
      key: 'code',
      label: '生成代码',
      icon: <CodeOutlined />,
      onClick: () => handleQuickAction('code'),
      disabled: allComponents.length === 0
    }
  ]

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isConfigured) {
    return (
      <Card
        title={
          <Space>
            <RobotOutlined />
            AI助手
          </Space>
        }
        size="small"
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' } }}
      >
        <Empty
          image={<RobotOutlined style={{ fontSize: 48, color: '#1890ff' }} />}
          description={
            <div>
              <Text>AI助手未配置</Text>
              <br />
              <Text type="secondary">请先配置AI服务提供商和API Key</Text>
            </div>
          }
        >
          <Button type="primary" onClick={() => setConfigVisible(true)}>
            配置AI助手
          </Button>
        </Empty>
        
        <AIConfigModal
          visible={configVisible}
          onCancel={() => setConfigVisible(false)}
          onOk={() => setConfigVisible(false)}
        />
      </Card>
    )
  }

  return (
    <Card
      title={
        <Space>
          <RobotOutlined />
          AI助手
          <Text type="secondary">({aiConfigManager.getCurrentProvider()?.name})</Text>
        </Space>
      }
      size="small"
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', padding: 0 } }}
      extra={
        <Space>
          <Dropdown menu={{ items: menuItems }} placement="bottomRight">
            <Button size="small" icon={<BulbOutlined />}>
              快速操作
            </Button>
          </Dropdown>
          <Tooltip title="清空对话">
            <Button 
              size="small" 
              icon={<ClearOutlined />} 
              onClick={handleClear}
              disabled={messages.length === 0}
            />
          </Tooltip>
          <Tooltip title="AI配置">
            <Button 
              size="small" 
              icon={<SettingOutlined />} 
              onClick={() => setConfigVisible(true)}
            />
          </Tooltip>
        </Space>
      }
    >
      {/* 消息列表 */}
      <div style={{ 
        flex: 1, 
        padding: '16px', 
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 300px)'
      }}>
        {messages.length === 0 ? (
          <Empty
            image={<RobotOutlined style={{ fontSize: 32, color: '#ccc' }} />}
            description="开始与AI助手对话吧！"
            style={{ marginTop: 60 }}
          />
        ) : (
          <List
            dataSource={messages}
            renderItem={(message) => (
              <List.Item style={{ border: 'none', padding: '8px 0' }}>
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      icon={message.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                      style={{ 
                        backgroundColor: message.role === 'user' ? '#1890ff' : '#52c41a'
                      }}
                    />
                  }
                  title={
                    <Space>
                      <Text strong>
                        {message.role === 'user' ? '你' : 'AI助手'}
                      </Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {formatTime(message.timestamp)}
                      </Text>
                    </Space>
                  }
                  description={
                    <div>
                      <Paragraph 
                        style={{ 
                          margin: 0, 
                          whiteSpace: 'pre-wrap',
                          backgroundColor: message.role === 'user' ? '#f6f8ff' : '#f6ffed',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: message.role === 'user' ? '1px solid #d9e5ff' : '1px solid #d9f7be'
                        }}
                      >
                        {message.content}
                      </Paragraph>
                      {message.code && onCodeGenerated && (
                        <div style={{ marginTop: '8px' }}>
                          <Button 
                            type="primary" 
                            size="small"
                            icon={<CodeOutlined />}
                            onClick={() => onCodeGenerated(message.code!)}
                          >
                            应用到画布
                          </Button>
                        </div>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
        {loading && (
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <Spin size="small" />
            <Text type="secondary" style={{ marginLeft: 8 }}>
              AI正在思考中...
            </Text>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div style={{ 
        padding: '16px', 
        borderTop: '1px solid #f0f0f0',
        backgroundColor: '#fafafa'
      }}>
        <Space.Compact style={{ width: '100%' }}>
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="请输入您的问题..."
            autoSize={{ minRows: 1, maxRows: 3 }}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            disabled={loading}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={loading}
            disabled={!input.trim() || loading}
          />
        </Space.Compact>
        <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}>
          按 Enter 发送，Shift + Enter 换行
        </Text>
      </div>

      <AIConfigModal
        visible={configVisible}
        onCancel={() => setConfigVisible(false)}
        onOk={() => setConfigVisible(false)}
      />
    </Card>
  )
}

export default AIAssistant