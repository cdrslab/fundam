import React, { useState } from 'react'
import { Input, Button, List, Avatar, Typography, Space, message, Spin } from 'antd'
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons'

import { ChatMessage } from '../types'
import { generateId } from '../utils/helpers'

const { TextArea } = Input
const { Text, Paragraph } = Typography

interface AIChatProps {
  onGenerateComponent: (componentType: string, defaultProps: Record<string, any>) => void
}

const AIChat: React.FC<AIChatProps> = ({ onGenerateComponent }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '你好！我是 Fundam AI 助手，可以帮你快速生成页面组件。\n\n你可以这样告诉我：\n• "创建一个用户列表页面"\n• "添加一个登录表单"\n• "生成一个数据展示表格"\n\n我会根据你的需求自动生成对应的组件！',
      timestamp: Date.now()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)

  // 模拟AI对话处理
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: inputValue,
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setLoading(true)

    // 模拟AI处理延迟
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue)
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: aiResponse.content,
        timestamp: Date.now()
      }

      setMessages(prev => [...prev, assistantMessage])
      setLoading(false)

      // 如果AI建议生成组件，自动创建
      if (aiResponse.shouldCreateComponent) {
        onGenerateComponent(aiResponse.componentType!, aiResponse.componentProps!)
        message.success(`已为你创建${aiResponse.componentType}组件`)
      }
    }, 1000 + Math.random() * 1000)
  }

  // 生成AI响应（简单的规则匹配）
  const generateAIResponse = (input: string): {
    content: string
    shouldCreateComponent: boolean
    componentType?: string
    componentProps?: Record<string, any>
  } => {
    const lowercaseInput = input.toLowerCase()

    // 检测用户意图并生成相应组件
    if (lowercaseInput.includes('列表') || lowercaseInput.includes('表格') || lowercaseInput.includes('数据展示')) {
      return {
        content: '我为你创建了一个数据列表页面，包含搜索功能和数据表格。你可以在右侧面板中进一步配置表格的列和数据源。',
        shouldCreateComponent: true,
        componentType: 'PageListQuery',
        componentProps: {
          formItems: [],
          tableProps: {
            columns: [
              { title: 'ID', dataIndex: 'id', key: 'id' },
              { title: '名称', dataIndex: 'name', key: 'name' },
              { title: '创建时间', dataIndex: 'createTime', key: 'createTime' }
            ],
            dataApi: '/api/list'
          }
        }
      }
    }

    if (lowercaseInput.includes('表单') || lowercaseInput.includes('输入') || lowercaseInput.includes('提交')) {
      return {
        content: '我为你创建了一个表单组件。你可以在表单中添加各种输入控件，如输入框、选择器等。',
        shouldCreateComponent: true,
        componentType: 'Form',
        componentProps: {
          layout: 'vertical'
        }
      }
    }

    if (lowercaseInput.includes('按钮')) {
      return {
        content: '我为你添加了一个按钮组件。你可以在右侧属性面板中修改按钮的文字、样式和点击事件。',
        shouldCreateComponent: true,
        componentType: 'Button',
        componentProps: {
          children: '按钮',
          type: 'primary'
        }
      }
    }

    if (lowercaseInput.includes('卡片') || lowercaseInput.includes('容器')) {
      return {
        content: '我为你创建了一个卡片容器组件，可以用来包裹其他内容。',
        shouldCreateComponent: true,
        componentType: 'Card',
        componentProps: {
          title: '卡片标题',
          children: '卡片内容'
        }
      }
    }

    // 默认回复
    return {
      content: '我理解你的需求。请告诉我你想要创建什么类型的组件，比如：\n\n• 数据列表页面\n• 表单页面\n• 按钮组件\n• 卡片容器\n\n我会根据你的描述自动生成相应的组件！',
      shouldCreateComponent: false
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="ai-chat">
      <div className="chat-messages">
        <List
          dataSource={messages}
          renderItem={(message) => (
            <List.Item style={{ border: 'none', padding: '8px 16px' }}>
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
                  <Text strong>
                    {message.role === 'user' ? '你' : 'AI助手'}
                  </Text>
                }
                description={
                  <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-line' }}>
                    {message.content}
                  </Paragraph>
                }
              />
            </List.Item>
          )}
        />
        {loading && (
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <Space>
              <Spin size="small" />
              <Text type="secondary">AI正在思考中...</Text>
            </Space>
          </div>
        )}
      </div>
      
      <div className="chat-input">
        <Space.Compact style={{ display: 'flex' }}>
          <TextArea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="描述你想要的组件，比如：创建一个用户列表页面"
            autoSize={{ minRows: 1, maxRows: 3 }}
            disabled={loading}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            loading={loading}
            disabled={!inputValue.trim()}
          />
        </Space.Compact>
      </div>
    </div>
  )
}

export default AIChat