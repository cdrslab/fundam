import type { ChatMessage, ComponentConfig, GlobalConfig, CodeChange } from '../types'
import { CodeTemplateManager } from '../utils/codeTemplate'

export interface AIResponse {
  success: boolean
  message: string
  code?: string
  changes?: CodeChange[]
  summary?: string
  error?: string
}

/**
 * AI服务 - 处理智能对话和代码生成
 */
export class AIService {
  private apiKey: string = ''
  private baseUrl: string = ''
  private provider: string = ''

  constructor(config?: { apiKey?: string; baseUrl?: string; provider?: string }) {
    if (config) {
      this.apiKey = config.apiKey || ''
      this.baseUrl = config.baseUrl || ''
      this.provider = config.provider || ''
    }
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

      const response = await this.callAI(prompt)

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
    }
  ): Promise<AIResponse> {
    try {
      let prompt = message

      // 如果有上下文，添加到提示词中
      if (context) {
        prompt = this.buildContextualPrompt(message, context)
      }

      return await this.callAI(prompt)
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

    if (context.globalConfig) {
      prompt += `## 全局配置
- API接口: ${Object.keys(context.globalConfig.apis).join(', ')}
- 全局变量: ${Object.keys(context.globalConfig.variables).join(', ')}

`
    }

    prompt += `请结合上下文信息，提供准确的建议和解决方案。如果需要生成代码，请使用Fundam组件库的组件。`

    return prompt
  }

  /**
   * 调用AI API
   */
  private async callAI(prompt: string): Promise<AIResponse> {
    // 这里应该调用实际的AI API
    // 当前返回模拟响应

    // 模拟AI响应延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    return {
      success: true,
      message: `AI助手理解了您的需求。基于当前上下文，我建议：

1. **功能分析**: 根据组件类型和页面结构，该组件适合添加以下功能...
2. **代码建议**: 建议使用Fundam组件库的相关组件...
3. **最佳实践**: 考虑用户体验和性能优化...

如需具体实现，请告诉我更多细节。`,
      code: '// AI生成的代码将在这里显示',
      summary: 'AI成功分析了您的需求并提供了建议'
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

    return await this.callAI(prompt)
  }
}

// 默认AI服务实例
export const aiService = new AIService()
