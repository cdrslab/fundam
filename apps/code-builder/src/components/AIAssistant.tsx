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
  type MenuProps,
  Alert,
  Tag
} from 'antd'
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  ClearOutlined,
  BulbOutlined,
  CodeOutlined,
  ThunderboltOutlined,
  ApiOutlined,
  BugOutlined
} from '@ant-design/icons'

import type { ComponentConfig, ChatMessage } from '../types'
import { aiService } from '../services/aiService'
import useCodeBuilderStore from '../store'
import { v4 as uuidv4 } from 'uuid'

const { TextArea } = Input
const { Text } = Typography

interface AIAssistantProps {
  selectedComponent?: ComponentConfig
}

const AIAssistant: React.FC<AIAssistantProps> = ({ selectedComponent }) => {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    chatMessages,
    addChatMessage,
    components,
    globalConfig,
    updateCode,
    updateGlobalConfig,
    editorState
  } = useCodeBuilderStore()

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // 发送普通消息
  const handleSendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
      componentId: selectedComponent?.identity.id
    }

    addChatMessage(userMessage)
    setInput('')
    setLoading(true)

    try {
      const response = await aiService.chat(userMessage.content, {
        selectedComponent,
        pageComponents: components,
        globalConfig
      })

      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: response.message,
        timestamp: Date.now(),
        componentId: selectedComponent?.identity.id,
        changes: response.changes
      }

      addChatMessage(assistantMessage)

      // 如果AI返回了代码，应用到编辑器
      if (response.code) {
        updateCode(response.code)
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: `抱歉，发生了错误：${error instanceof Error ? error.message : '未知错误'}`,
        timestamp: Date.now()
      }
      addChatMessage(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // 智能完善功能
  const handleIntelligentEnhancement = async () => {
    if (!selectedComponent || loading) return

    setLoading(true)

    const enhancementMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: `智能完善「${selectedComponent.identity.name}」组件功能`,
      timestamp: Date.now(),
      componentId: selectedComponent.identity.id
    }

    addChatMessage(enhancementMessage)

    try {
      const response = await aiService.intelligentEnhancement(
        selectedComponent,
        components,
        globalConfig
      )

      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: response.message,
        timestamp: Date.now(),
        componentId: selectedComponent.identity.id,
        changes: response.changes
      }

      addChatMessage(assistantMessage)

      // 应用AI的改进
      if (response.code) {
        updateCode(response.code)
      }

      // 如果有全局配置变更
      if (response.changes) {
        response.changes.forEach(change => {
          if (change.type === 'create' && change.target === 'api') {
            // 添加新的API配置
            const newApis = {
              ...globalConfig.apis,
              [change.targetId]: JSON.parse(change.after || '{}')
            }
            updateGlobalConfig({ apis: newApis })
          }
        })
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: `智能完善失败：${error instanceof Error ? error.message : '未知错误'}`,
        timestamp: Date.now()
      }
      addChatMessage(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // 快速操作
  const handleQuickAction = async (action: string) => {
    let prompt = ''

    switch (action) {
      case 'generate_page':
        prompt = '帮我生成一个用户管理页面，包含列表查询、新增、编辑、删除功能'
        break
      case 'optimize_code':
        prompt = '请优化当前页面的代码结构和性能'
        break
      case 'add_validation':
        prompt = '为当前表单添加完整的验证规则'
        break
      case 'generate_api':
        prompt = '根据当前页面功能，生成对应的API接口配置'
        break
      case 'fix_errors':
        prompt = '检查并修复当前代码中的错误和问题'
        break
      default:
        return
    }

    setInput(prompt)
  }

  // 清空对话
  const handleClearChat = () => {
    // 清空当前组件相关的对话
    // TODO: 实现清空功能
  }

  // 快速操作菜单
  const quickActionItems: MenuProps['items'] = [
    {
      key: 'generate_page',
      label: '生成页面',
      icon: <CodeOutlined />,
      onClick: () => handleQuickAction('generate_page')
    },
    {
      key: 'optimize_code',
      label: '优化代码',
      icon: <ThunderboltOutlined />,
      onClick: () => handleQuickAction('optimize_code')
    },
    {
      key: 'add_validation',
      label: '添加验证',
      icon: <BugOutlined />,
      onClick: () => handleQuickAction('add_validation')
    },
    {
      key: 'generate_api',
      label: '生成API',
      icon: <ApiOutlined />,
      onClick: () => handleQuickAction('generate_api')
    },
    {
      key: 'fix_errors',
      label: '修复错误',
      icon: <BugOutlined />,
      onClick: () => handleQuickAction('fix_errors')
    }
  ]

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <RobotOutlined />
            <span>AI助手</span>
            {selectedComponent && (
              <Tag size="small" color="blue">
                {selectedComponent.identity.name}
              </Tag>
            )}
          </Space>

          <Space>
            {selectedComponent && (
              <Tooltip title="智能完善">
                <Button
                  size="small"
                  type="primary"
                  icon={<BulbOutlined />}
                  onClick={handleIntelligentEnhancement}
                  loading={loading}
                >
                  智能完善
                </Button>
              </Tooltip>
            )}

            <Dropdown menu={{ items: quickActionItems }} placement="bottomRight">
              <Button size="small" icon={<ThunderboltOutlined />}>
                快速操作
              </Button>
            </Dropdown>

            <Tooltip title="清空对话">
              <Button
                size="small"
                icon={<ClearOutlined />}
                onClick={handleClearChat}
                disabled={chatMessages.length === 0}
              />
            </Tooltip>
          </Space>
        </div>
      }
      size="small"
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', padding: 0 } }}
    >
      {/* 当前组件信息 */}
      {selectedComponent && (
        <div style={{
          padding: '12px 16px',
          background: '#f8f9fa',
          borderBottom: '1px solid #e8e8e8'
        }}>
          <div style={{ fontSize: '12px', color: '#666' }}>
            当前选中组件
          </div>
          <div style={{ fontSize: '13px', fontWeight: 500, marginTop: 2 }}>
            {selectedComponent.identity.name} ({selectedComponent.identity.type})
          </div>
          {selectedComponent.aiSummary && (
            <div style={{ fontSize: '11px', color: '#999', marginTop: 4 }}>
              {selectedComponent.aiSummary}
            </div>
          )}
        </div>
      )}

      {/* 消息列表 */}
      <div style={{
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
        maxHeight: '300px'
      }}>
        {chatMessages.length === 0 ? (
          <Empty
            image={<RobotOutlined style={{ fontSize: 32, color: '#ccc' }} />}
            description={
              <div style={{ color: '#999' }}>
                <div>开始与AI助手对话</div>
                <div style={{ fontSize: '12px', marginTop: 4 }}>
                  {selectedComponent
                    ? `针对「${selectedComponent.identity.name}」组件进行智能对话`
                    : '选择组件后可进行针对性对话'
                  }
                </div>
              </div>
            }
            style={{ margin: '40px 0' }}
          />
        ) : (
          <List
            dataSource={chatMessages.filter(msg =>
              !selectedComponent || msg.componentId === selectedComponent.identity.id || !msg.componentId
            )}
            renderItem={(message) => (
              <List.Item style={{ border: 'none', padding: '8px 0' }}>
                <div style={{ width: '100%' }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    gap: 8
                  }}>
                    <Avatar
                      icon={message.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                      style={{
                        backgroundColor: message.role === 'user' ? '#1890ff' : '#52c41a',
                        flexShrink: 0
                      }}
                      size="small"
                    />

                    <div style={{
                      flex: 1,
                      maxWidth: '85%'
                    }}>
                      <div style={{
                        background: message.role === 'user' ? '#1890ff' : '#f6f8ff',
                        color: message.role === 'user' ? 'white' : '#333',
                        padding: '8px 12px',
                        borderRadius: 8,
                        fontSize: '13px',
                        lineHeight: 1.4,
                        wordBreak: 'break-word'
                      }}>
                        {message.content}
                      </div>

                      <div style={{
                        fontSize: '11px',
                        color: '#999',
                        marginTop: 4,
                        textAlign: message.role === 'user' ? 'right' : 'left'
                      }}>
                        {formatTime(message.timestamp)}
                        {message.componentId && (
                          <span style={{ marginLeft: 8 }}>
                            • 组件相关
                          </span>
                        )}
                      </div>

                      {/* 显示代码变更 */}
                      {message.changes && message.changes.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          <Alert
                            message="本次变更"
                            description={
                              <div>
                                {message.changes.map((change, index) => (
                                  <div key={index} style={{ fontSize: '12px', marginBottom: 4 }}>
                                    • {change.description}
                                  </div>
                                ))}
                              </div>
                            }
                            type="info"
                            size="small"
                            showIcon
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <Spin size="small" />
            <Text type="secondary" style={{ marginLeft: 8, fontSize: '12px' }}>
              AI正在思考中...
            </Text>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid #e8e8e8',
        background: '#fafafa'
      }}>
        <div style={{ marginBottom: 8 }}>
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              selectedComponent
                ? `询问关于「${selectedComponent.identity.name}」的问题...`
                : '请输入您的问题...'
            }
            autoSize={{ minRows: 1, maxRows: 3 }}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            disabled={loading}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '11px', color: '#999' }}>
            Enter 发送，Shift + Enter 换行
          </div>

          <Button
            type="primary"
            size="small"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            loading={loading}
            disabled={!input.trim() || loading}
          >
            发送
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default AIAssistant
