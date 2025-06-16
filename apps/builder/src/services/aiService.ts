import { aiConfigManager } from '../store/aiConfig'
import type { ChatMessage } from '../types'

export interface ChatResponse {
  message: string
  success: boolean
  error?: string
  code?: string
  shouldRender?: boolean
}

class AIService {
  async chat(messages: ChatMessage[], systemPrompt?: string): Promise<ChatResponse> {
    const config = aiConfigManager.getConfig()
    const provider = aiConfigManager.getCurrentProvider()

    if (!provider || !aiConfigManager.isConfigured()) {
      return {
        message: '',
        success: false,
        error: '请先配置AI服务提供商和API Key'
      }
    }

    const apiKey = aiConfigManager.getApiKey(provider.id)
    if (!apiKey) {
      return {
        message: '',
        success: false,
        error: `请配置${provider.name}的API Key`
      }
    }

    try {
      const response = await fetch(`${provider.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: config.currentModel,
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            }))
          ],
          temperature: config.temperature,
          max_tokens: config.maxTokens
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('无效的API响应格式')
      }

      const responseContent = data.choices[0].message.content

      // 检查是否包含TSX代码
      const codeMatch = responseContent.match(/```tsx\n([\s\S]*?)\n```/)
      if (codeMatch) {
        return {
          message: responseContent,
          success: true,
          code: codeMatch[1].trim(),
          shouldRender: true
        }
      }

      return {
        message: responseContent,
        success: true
      }
    } catch (error) {
      console.error('AI请求失败:', error)
      return {
        message: '',
        success: false,
        error: error instanceof Error ? error.message : '请求失败'
      }
    }
  }

  async generateComponent(description: string, currentComponents?: any[]): Promise<ChatResponse> {
    const componentsInfo = currentComponents && currentComponents.length > 0
      ? `\n\n当前页面已有组件：\n${JSON.stringify(currentComponents.map(c => ({
          type: c.type,
          id: c.id.slice(-6),
          props: Object.keys(c.props)
        })), null, 2)}`
      : ''

    const systemPrompt = `你是Fundam组件库的代码生成专家。你必须只使用Fundam组件，禁止使用普通的antd组件。

# 严格约束
**你必须严格按照以下格式返回，不能有任何其他内容：**

\`\`\`tsx
const GeneratedPage: React.FC = () => {
  // 组件逻辑和状态
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
6. **禁止TypeScript类型注解** - 不要写: Record<string, any>等类型
7. **组件名必须是GeneratedPage**
8. **图标用Emoji**: 🔍 ➕ ✏️ 🗑️ 👤 ⬇️ ⬆️


# 必须使用的Fundam组件
## 🏆 核心页面组件
- **PageListQuery**: 列表查询页面(包含搜索+表格)，这是最重要的组件！
- **ModalForm**: 模态框表单组件（注意：这是一个组件，不是函数）

## 📋 表单组件 (必须使用)
- **Form**: Fundam增强表单(不是antd Form!)
- **FormItemInput**: 输入框(不是Input!)
- **FormItemSelect**: 下拉选择(不是Select!)
- **FormItemTextArea**: 文本域
- **FormItemCheckbox**: 复选框
- **FormItemRadio**: 单选框
- **FormItemDatePickerRangePicker**: 日期选择

## 📊 数据展示 (必须使用)
- **ProTable**: 增强表格(不是antd Table!)
- **Table**: Fundam基础表格

## 🎨 布局组件 (必须使用)
- **Card**: Fundam卡片(不是antd Card!)
- **Space**: Fundam间距组件
- **Tabs**: Fundam标签页

## ⚠️ 仅当Fundam没有时才可使用antd
- Button, message, Modal, Row, Col, Typography
- 但优先考虑Fundam组件的解决方案

# 强制要求
1. **列表页面必须用PageListQuery** - 这是Fundam的核心组件！
2. **表单必须用Form + FormItem系列** - 不要用antd原生表单！
3. **表格必须用ProTable** - 功能比antd Table强大！
4. **不写任何TypeScript类型定义**
5. **简化状态管理，专注功能实现**

# 标准模式
用户要求列表页面时，必须使用这个模式：
\`\`\`tsx
const GeneratedPage: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(null)
  
  const columns = [
    { title: '姓名', dataIndex: 'name' },
    { title: '状态', dataIndex: 'status' },
    {
      title: '操作',
      render: (_, record) => (
        <Button type="link" onClick={() => {
          setCurrentRecord(record)
          setModalVisible(true)
        }}>编辑</Button>
      )
    }
  ]
  
  return (
    <>
      <PageListQuery
        formItems={
          <>
            <FormItemInput name="name" label="姓名" />
            <FormItemSelect name="status" label="状态" />
          </>
        }
        tableProps={{
          columns: columns,
          dataSource: mockData
        }}
      />
      
      <ModalForm
        visible={modalVisible}
        title="编辑"
        onCancel={() => setModalVisible(false)}
        onFinish={(values) => {
          console.log(values)
          setModalVisible(false)
        }}
      >
        <FormItemInput name="name" label="姓名" />
        <FormItemSelect name="status" label="状态" />
      </ModalForm>
    </>
  )
}
\`\`\`

重要：ModalForm是一个React组件，不是函数！必须作为JSX元素使用，需要用visible属性控制显示隐藏。

# 用户需求
${description}${componentsInfo}

请直接生成TSX代码，优先使用Fundam组件，不要任何解释文字。

# 代码质量要求
- 确保每个const都有完整的初始化
- 确保没有悬挂的类型声明
- 确保代码语法完全正确
- 确保所有变量都被正确定义和使用`

    const messages: ChatMessage[] = [
      {
        id: 'user-1',
        role: 'user',
        content: description,
        timestamp: Date.now()
      }
    ]

    const response = await this.chat(messages, systemPrompt)

    if (response.success) {
      const codeMatch = response.message.match(/```tsx\n([\s\S]*?)\n```/)
      if (codeMatch) {
        return {
          ...response,
          code: codeMatch[1].trim(),
          shouldRender: true
        }
      }
    }

    return response
  }

  async improveComponent(_componentConfig: any, improvement: string, allComponents?: any[]): Promise<ChatResponse> {
    const systemPrompt = `你是Fundam组件库的代码优化专家。你必须只使用Fundam组件，禁止使用antd原生组件。

# 严格约束
**你必须严格按照以下格式返回，不能有任何其他内容：**

\`\`\`tsx
const GeneratedPage: React.FC = () => {
  // 优化后的组件逻辑
  return (
    <div>
      {/* 优化后的组件JSX */}
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
6. **禁止TypeScript类型注解** - 不要写: Record<string, any>等类型
7. **组件名必须是GeneratedPage**

# 必须使用Fundam组件
- **PageListQuery**: 列表查询页面
- **Form**: Fundam表单(不是antd Form!)
- **FormItemInput**: 输入框(不是Input!)
- **FormItemSelect**: 下拉选择(不是Select!)
- **ProTable**: 增强表格(不是antd Table!)
- **Card**: Fundam卡片(不是antd Card!)

# 当前页面组件结构
${allComponents && allComponents.length > 0 ? `
\`\`\`json
${JSON.stringify(allComponents.map(c => ({
  type: c.type,
  id: c.id.slice(-6),
  props: c.props,
  parentId: c.parentId?.slice(-6) || null
})), null, 2)}
\`\`\`
` : '当前页面为空'}

# 优化要求
${improvement}

# 优化指导原则
1. 保持现有功能的基础上进行改进
2. 使用更合适的Fundam/Antd组件
3. 优化布局和用户体验
4. 添加必要的交互逻辑
5. 确保代码可以直接运行
6. 组件名必须是GeneratedPage

请直接生成优化后的TSX代码，不要任何解释文字。`

    const messages: ChatMessage[] = [
      {
        id: 'user-1',
        role: 'user',
        content: improvement,
        timestamp: Date.now()
      }
    ]

    const response = await this.chat(messages, systemPrompt)

    if (response.success) {
      const codeMatch = response.message.match(/```tsx\n([\s\S]*?)\n```/)
      if (codeMatch) {
        return {
          ...response,
          code: codeMatch[1].trim(),
          shouldRender: true
        }
      }
    }

    return response
  }

  async generatePageCode(components: any[]): Promise<ChatResponse> {
    const systemPrompt = `你是Fundam组件库的代码生成专家。你必须只使用Fundam组件，禁止使用antd原生组件。

# 严格约束
**你必须严格按照以下格式返回，不能有任何其他内容：**

\`\`\`tsx
const GeneratedPage: React.FC = () => {
  // 状态定义和事件处理逻辑
  
  return (
    <div>
      {/* 根据配置渲染的组件JSX */}
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
6. **禁止TypeScript类型注解** - 不要写: Record<string, any>等类型
7. **组件名必须是GeneratedPage**

# 必须使用Fundam组件
- **PageListQuery**: 列表查询页面
- **Form**: Fundam表单(不是antd Form!)
- **FormItemInput**: 输入框(不是Input!)
- **FormItemSelect**: 下拉选择(不是Select!)
- **ProTable**: 增强表格(不是antd Table!)
- **Card**: Fundam卡片(不是antd Card!)

# 组件配置数据
\`\`\`json
${JSON.stringify(components, null, 2)}
\`\`\`

# 代码生成要求
1. 严格按照配置数据的组件类型和属性生成代码
2. 如果有Table组件，生成相应的mock数据
3. 如果有Form组件，添加表单处理逻辑
4. 使用React Hooks管理状态
5. 添加必要的事件处理函数
6. 确保代码可以直接运行
7. 组件名必须是GeneratedPage

请直接生成TSX代码，不要任何解释文字。

# 代码质量要求
- 确保每个const都有完整的初始化
- 确保没有悬挂的类型声明
- 确保代码语法完全正确
- 确保所有变量都被正确定义和使用`

    const messages: ChatMessage[] = [
      {
        id: 'user-1',
        role: 'user',
        content: '请将上述组件配置生成完整的React页面代码',
        timestamp: Date.now()
      }
    ]

    const response = await this.chat(messages, systemPrompt)

    if (response.success) {
      const codeMatch = response.message.match(/```tsx\n([\s\S]*?)\n```/)
      if (codeMatch) {
        return {
          ...response,
          code: codeMatch[1].trim(),
          shouldRender: true
        }
      }
    }

    return response
  }
}

export const aiService = new AIService()
