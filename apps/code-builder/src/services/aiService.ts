import type { ChatMessage, ComponentConfig, GlobalConfig, CodeChange } from '../types'
import { CodeTemplateManager } from '../utils/codeTemplate'
import { aiConfigManager, type AIProvider } from '../store/aiConfig'

export interface AIResponse {
  success: boolean
  message: string
  code?: string
  changes?: CodeChange[]
  summary?: string
  error?: string
}

interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * AI服务 - 处理智能对话和代码生成
 */
export class AIService {
  constructor() {
    // 配置通过aiConfigManager管理，不需要构造函数参数
  }

  /**
   * 检查AI服务是否已配置
   */
  private checkConfiguration(): { success: boolean; error?: string } {
    const provider = aiConfigManager.getCurrentProvider()
    if (!provider) {
      return { success: false, error: '请先配置AI服务提供商' }
    }

    if (!aiConfigManager.isConfigured()) {
      return { success: false, error: '请先配置API Key' }
    }

    return { success: true }
  }

  /**
   * 获取System Prompt
   */
  private getSystemPrompt(): string {
    return `你是一个专业的前端开发助手，专门用于帮助用户使用Fundam组件库开发React应用。

## 重要：代码格式要求
当用户要求生成页面或组件时，你必须按照以下格式返回完整的TSX代码：

\`\`\`tsx
import React from 'react'
import { Button, Card } from 'antd'
import { PageListQuery, FormItemInput } from '@fundam/antd'

const GeneratedPage: React.FC = () => {
  return (
    <div className="page-container">
      {/* 生成的组件放在这里 */}
    </div>
  )
}

export default GeneratedPage
\`\`\`

## Fundam组件库核心组件
- PageListQuery: 列表查询页面，整合搜索表单和数据表格
- FormItemInput: 输入框表单项
- FormItemSelect: 下拉选择表单项
- ModalForm: 模态框表单
- ProTable: 增强型表格
- Button: 操作按钮

## 代码规范
- 使用TypeScript严格模式
- 遵循React Hooks最佳实践
- 组件采用函数式写法
- 组件名固定为 GeneratedPage
- 容器div必须使用 className="page-container"
- 必须包含完整的import语句

## 响应格式
如果用户要求生成页面代码，请：
1. 直接返回完整的TSX代码块
2. 代码必须包含在 \`\`\`tsx 中
3. 如果是修改现有代码，返回完整的修改后代码，不要只返回片段

请确保生成的代码符合最佳实践，可以直接使用。`
  }

  /**
   * 获取全局代码生成的System Prompt
   */
  private getGlobalSystemPrompt(): string {
    return `你是一个专业的React页面生成助手，专门用于生成基于Fundam组件库的完整页面代码。

## 技术栈
- React 18+ with TypeScript
- Fundam组件库 (基于Ant Design)
- 现代React Hooks开发模式

## 代码要求
1. **完整性**: 生成完整可运行的页面代码
2. **规范性**: 严格遵循TypeScript和React最佳实践
3. **可读性**: 代码结构清晰，注释适当
4. **实用性**: 生成的页面具有实际业务价值

## 组件优先级
1. 优先使用Fundam组件库组件
2. 其次使用Ant Design原生组件
3. 避免使用HTML原生标签

## 响应格式
直接返回完整的TSX代码，包含：
- 必要的import语句
- 完整的组件定义
- 合理的状态管理
- 事件处理逻辑
- 默认导出

请确保代码可以直接使用，无需额外修改。`
  }

  /**
   * 智能完善组件功能
   * 根据选中组件的上下文自动完善功能
   */
  async intelligentEnhancement(
    selectedComponent: ComponentConfig,
    pageComponents: ComponentConfig[],
    globalConfig: GlobalConfig
  ): Promise<AIResponse> {
    try {
      const prompt = this.buildEnhancementPrompt(selectedComponent, pageComponents, globalConfig)

      const systemPrompt = this.getSystemPrompt()
      const response = await this.callAI(prompt, systemPrompt)

      if (response.success) {
        // 解析AI返回的代码和配置变更
        const changes = this.parseAIResponse(response.message, selectedComponent, globalConfig)

        return {
          success: true,
          message: response.message,
          code: response.code,
          changes,
          summary: this.generateEnhancementSummary(changes)
        }
      }

      return response
    } catch (error) {
      return {
        success: false,
        message: '智能完善失败',
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  /**
   * 构建组件增强提示词
   */
  private buildEnhancementPrompt(
    selectedComponent: ComponentConfig,
    pageComponents: ComponentConfig[],
    globalConfig: GlobalConfig
  ): string {
    const componentType = selectedComponent.identity.type
    const componentName = selectedComponent.identity.name
    const componentProps = selectedComponent.props

    // 分析页面上下文
    const pageContext = this.analyzePageContext(pageComponents, globalConfig)

    let prompt = `你是一个专业的前端开发助手，专门用于智能完善React组件功能。

## 当前选中组件信息
- 组件类型: ${componentType}
- 组件名称: ${componentName}
- 组件ID: ${selectedComponent.identity.id}
- 当前属性: ${JSON.stringify(componentProps, null, 2)}

## 页面上下文
${pageContext}

## 全局配置
- API接口: ${JSON.stringify(globalConfig.apis, null, 2)}
- 全局变量: ${JSON.stringify(globalConfig.variables, null, 2)}

## 任务要求
请根据组件类型和上下文，智能完善该组件的功能：

`

    // 根据组件类型添加特定的增强提示
    switch (componentType) {
      case 'Button':
        prompt += this.buildButtonEnhancementPrompt(componentProps, pageComponents, globalConfig)
        break
      case 'FormItemInput':
      case 'FormItemSelect':
        prompt += this.buildFormItemEnhancementPrompt(componentType, componentProps, pageComponents)
        break
      case 'Table':
      case 'PageListQuery':
        prompt += this.buildTableEnhancementPrompt(componentProps, globalConfig)
        break
      case 'Modal':
        prompt += this.buildModalEnhancementPrompt(componentProps, pageComponents, globalConfig)
        break
      default:
        prompt += `根据${componentType}组件的特性，智能完善其功能和配置。`
    }

    prompt += `

## 输出格式要求
请按以下格式返回：

1. **功能说明**: 简要说明你为该组件添加了什么功能
2. **代码变更**: 如果需要修改组件代码，请提供完整的TSX代码
3. **配置变更**: 如果需要修改全局配置（如API接口），请明确说明
4. **关联组件**: 如果影响到其他组件，请说明

请确保：
- 使用Fundam组件库的组件
- 遵循现有的命名规范和代码结构
- 生成的代码符合TypeScript规范
- 考虑用户体验和交互逻辑的合理性`

    return prompt
  }

  /**
   * 构建按钮增强提示词
   */
  private buildButtonEnhancementPrompt(
    buttonProps: Record<string, any>,
    pageComponents: ComponentConfig[],
    globalConfig: GlobalConfig
  ): string {
    const buttonText = buttonProps.children || buttonProps.title || '按钮'

    // 检查页面是否有表格和表单
    const hasTable = pageComponents.some(comp =>
      comp.identity.type === 'Table' || comp.identity.type === 'PageListQuery'
    )
    const hasForm = pageComponents.some(comp =>
      comp.identity.type === 'Form' || comp.identity.type === 'ModalForm'
    )

    let suggestion = ''

    if (buttonText.includes('新增') || buttonText.includes('添加')) {
      suggestion = `
### 新增按钮增强建议：
1. 自动关联新增弹窗功能
2. 如果页面有表格，弹窗中应包含表格对应的表单字段
3. 自动关联全局新增API接口
4. 添加成功后刷新列表数据
5. 提供用户友好的操作反馈`
    } else if (buttonText.includes('编辑') || buttonText.includes('修改')) {
      suggestion = `
### 编辑按钮增强建议：
1. 自动获取当前行数据填充表单
2. 关联编辑弹窗功能
3. 自动关联全局编辑API接口
4. 编辑成功后更新列表数据`
    } else if (buttonText.includes('删除')) {
      suggestion = `
### 删除按钮增强建议：
1. 添加删除确认对话框
2. 自动关联全局删除API接口
3. 删除成功后从列表中移除对应数据`
    } else if (buttonText.includes('查询') || buttonText.includes('搜索')) {
      suggestion = `
### 查询按钮增强建议：
1. 收集表单查询条件
2. 关联列表查询API接口
3. 实现数据筛选和搜索功能`
    }

    return suggestion + `
    
现有API接口：${Object.keys(globalConfig.apis).join(', ')}
如果缺少对应的API接口，请自动添加合适的接口配置。`
  }

  /**
   * 构建表单项增强提示词
   */
  private buildFormItemEnhancementPrompt(
    componentType: string,
    props: Record<string, any>,
    pageComponents: ComponentConfig[]
  ): string {
    return `
### 表单项增强建议：
1. 根据字段名称智能推断验证规则
2. 添加合适的placeholder提示文字
3. 为Select组件自动配置选项数据
4. 添加字段联动逻辑（如果适用）
5. 优化表单布局和样式`
  }

  /**
   * 构建表格增强提示词
   */
  private buildTableEnhancementPrompt(
    props: Record<string, any>,
    globalConfig: GlobalConfig
  ): string {
    return `
### 表格增强建议：
1. 自动配置分页功能
2. 添加操作列（编辑、删除按钮）
3. 关联数据查询API接口
4. 添加加载状态和空数据提示
5. 优化列宽和表格响应式布局`
  }

  /**
   * 构建弹窗增强提示词
   */
  private buildModalEnhancementPrompt(
    props: Record<string, any>,
    pageComponents: ComponentConfig[],
    globalConfig: GlobalConfig
  ): string {
    return `
### 弹窗增强建议：
1. 自动配置弹窗的显示/隐藏逻辑
2. 添加表单验证和提交功能
3. 关联对应的API接口
4. 添加加载状态和错误处理
5. 优化弹窗尺寸和用户体验`
  }

  /**
   * 分析页面上下文
   */
  private analyzePageContext(
    components: ComponentConfig[],
    globalConfig: GlobalConfig
  ): string {
    const componentTypes = components.map(comp => comp.identity.type)
    const componentCounts = componentTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const hasTable = componentTypes.includes('Table') || componentTypes.includes('PageListQuery')
    const hasForm = componentTypes.includes('Form') || componentTypes.includes('ModalForm')
    const hasModal = componentTypes.includes('Modal')

    return `
页面组件统计: ${Object.entries(componentCounts).map(([type, count]) => `${type}(${count}个)`).join(', ')}
页面特征: ${[
  hasTable ? '包含数据表格' : '',
  hasForm ? '包含表单' : '',
  hasModal ? '包含弹窗' : ''
].filter(Boolean).join(', ') || '基础页面'}
`
  }

  /**
   * 解析AI响应，提取代码变更
   */
  private parseAIResponse(
    response: string,
    selectedComponent: ComponentConfig,
    globalConfig: GlobalConfig
  ): CodeChange[] {
    const changes: CodeChange[] = []

    // 这里可以通过正则表达式或其他方式解析AI的响应
    // 提取代码变更、API变更等信息

    // 临时实现：假设AI返回了一些变更建议
    if (response.includes('新增API')) {
      changes.push({
        type: 'create',
        target: 'api',
        targetId: 'newApi',
        after: '新的API配置',
        description: 'AI自动添加新的API接口'
      })
    }

    return changes
  }

  /**
   * 生成增强功能摘要
   */
  private generateEnhancementSummary(changes: CodeChange[]): string {
    if (changes.length === 0) {
      return '未发现需要增强的功能'
    }

    const summaryItems = changes.map(change => {
      switch (change.type) {
        case 'create':
          return `✅ 新增了${change.target === 'api' ? 'API接口' : '组件功能'}: ${change.description}`
        case 'update':
          return `🔄 更新了${change.target === 'api' ? 'API接口' : '组件功能'}: ${change.description}`
        case 'delete':
          return `❌ 删除了${change.target === 'api' ? 'API接口' : '组件功能'}: ${change.description}`
        default:
          return change.description
      }
    })

    return summaryItems.join('\n')
  }

  /**
   * 普通AI对话
   */
  async chat(
    message: string,
    context?: {
      selectedComponent?: ComponentConfig
      pageComponents?: ComponentConfig[]
      globalConfig?: GlobalConfig
      currentCode?: string
    }
  ): Promise<AIResponse> {
    try {
      let prompt = message

      // 如果有上下文，添加到提示词中
      if (context) {
        prompt = this.buildContextualPrompt(message, context)
      }

      const systemPrompt = this.getSystemPrompt()
      const response = await this.callAI(prompt, systemPrompt)
      
      if (response.success) {
        // 尝试从AI回复中提取代码
        const extractedCode = this.extractCodeFromResponse(response.message)
        
        return {
          success: true,
          message: response.message,
          code: extractedCode,
          summary: '对话成功'
        }
      }
      
      return response
    } catch (error) {
      return {
        success: false,
        message: '对话失败',
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  /**
   * 构建带上下文的提示词
   */
  private buildContextualPrompt(
    userMessage: string,
    context: {
      selectedComponent?: ComponentConfig
      pageComponents?: ComponentConfig[]
      globalConfig?: GlobalConfig
      currentCode?: string
    }
  ): string {
    let prompt = `你是一个专业的前端开发助手，帮助用户使用Fundam组件库开发React应用。

## 用户消息
${userMessage}

`

    if (context.selectedComponent) {
      prompt += `## 当前选中组件
- 类型: ${context.selectedComponent.identity.type}
- 名称: ${context.selectedComponent.identity.name}
- 属性: ${JSON.stringify(context.selectedComponent.props, null, 2)}

`
    }

    if (context.pageComponents && context.pageComponents.length > 0) {
      prompt += `## 页面组件列表
${context.pageComponents.map(comp => 
  `- ${comp.identity.name} (${comp.identity.type})`
).join('\n')}

`
    }

    if (context.currentCode) {
      prompt += `## 当前页面代码
\`\`\`tsx
${context.currentCode}
\`\`\`

`
    }

    if (context.globalConfig) {
      prompt += `## 全局配置
- API接口: ${Object.keys(context.globalConfig.apis).join(', ')}
- 全局变量: ${Object.keys(context.globalConfig.variables).join(', ')}

`
    }

    prompt += `## 重要指导原则
1. 如果用户要求生成或修改页面，请返回完整的TSX代码，包含import语句和组件定义
2. 优先使用Fundam组件库：PageListQuery, FormItemInput, FormItemSelect, ModalForm, ProTable等
3. 确保代码可以直接使用，无需额外修改
4. 如果是修改现有代码，请返回完整的修改后代码
5. 代码必须符合TypeScript和React最佳实践

请结合上下文信息，提供准确的建议和解决方案。`

    return prompt
  }

  /**
   * 调用AI API
   */
  private async callAI(prompt: string, systemPrompt?: string): Promise<AIResponse> {
    const configCheck = this.checkConfiguration()
    if (!configCheck.success) {
      return {
        success: false,
        message: '',
        error: configCheck.error
      }
    }

    const provider = aiConfigManager.getCurrentProvider()!
    const config = aiConfigManager.getConfig()
    const apiKey = aiConfigManager.getApiKey(provider.id)

    try {
      const messages: ChatCompletionMessage[] = []
      
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt })
      }
      
      messages.push({ role: 'user', content: prompt })

      const response = await fetch(`${provider.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: config.currentModel,
          messages,
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

      const aiMessage = data.choices[0].message.content

      return {
        success: true,
        message: aiMessage,
        summary: `AI响应完成 (${data.usage?.total_tokens || 0} tokens)`
      }

    } catch (error) {
      console.error('AI API调用失败:', error)
      return {
        success: false,
        message: '',
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  /**
   * 全局对话 - 用于修改整个页面
   */
  async globalChat(
    message: string,
    currentCode: string,
    globalConfig: GlobalConfig
  ): Promise<AIResponse> {
    const prompt = `你是一个专业的全栈开发助手，帮助用户构建完整的React页面。

## 用户需求
${message}

## 当前页面代码
\`\`\`tsx
${currentCode}
\`\`\`

## 全局配置
${JSON.stringify(globalConfig, null, 2)}

请根据用户需求，修改或重写页面代码。要求：
1. 使用Fundam组件库的组件
2. 保持代码结构清晰
3. 遵循React和TypeScript最佳实践
4. 如需新的API接口，请在响应中说明

请提供完整的页面代码和修改说明。`

    const systemPrompt = this.getGlobalSystemPrompt()
    return await this.callAI(prompt, systemPrompt)
  }

  /**
   * 从AI回复中提取代码
   */
  private extractCodeFromResponse(responseMessage: string): string | undefined {
    // 尝试提取tsx代码块
    const tsxMatch = responseMessage.match(/```tsx\n([\s\S]*?)\n```/)
    if (tsxMatch) {
      return tsxMatch[1].trim()
    }

    // 尝试提取typescript代码块
    const tsMatch = responseMessage.match(/```typescript\n([\s\S]*?)\n```/)
    if (tsMatch) {
      return tsMatch[1].trim()
    }

    // 尝试提取js代码块
    const jsMatch = responseMessage.match(/```javascript\n([\s\S]*?)\n```/)
    if (jsMatch) {
      return jsMatch[1].trim()
    }

    // 尝试提取普通代码块
    const codeMatch = responseMessage.match(/```\n([\s\S]*?)\n```/)
    if (codeMatch) {
      const code = codeMatch[1].trim()
      // 检查是否看起来像React代码
      if (code.includes('import React') || code.includes('export default') || code.includes('<')) {
        return code
      }
    }

    // 如果没有代码块，查找可能的React组件代码
    const reactComponentMatch = responseMessage.match(/import React[\s\S]*?export default \w+/)
    if (reactComponentMatch) {
      return reactComponentMatch[0].trim()
    }

    return undefined
  }
}

// 默认AI服务实例
export const aiService = new AIService()
