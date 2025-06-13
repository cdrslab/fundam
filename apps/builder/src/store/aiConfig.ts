// AI配置管理
export interface AIProvider {
  id: string
  name: string
  baseUrl?: string
  models: string[]
}

export interface AIConfig {
  providers: AIProvider[]
  currentProvider: string
  currentModel: string
  apiKeys: Record<string, string>
  temperature: number
  maxTokens: number
}

const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo']
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    models: ['deepseek-chat', 'deepseek-coder']
  }
]

class AIConfigManager {
  private config: AIConfig = {
    providers: AI_PROVIDERS,
    currentProvider: 'openai',
    currentModel: 'gpt-4',
    apiKeys: {},
    temperature: 0.7,
    maxTokens: 8000
  }

  constructor() {
    this.loadConfig()
  }

  getConfig(): AIConfig {
    return { ...this.config }
  }

  updateConfig(updates: Partial<AIConfig>) {
    this.config = { ...this.config, ...updates }
    this.saveConfig()
  }

  setApiKey(provider: string, apiKey: string) {
    this.config.apiKeys[provider] = apiKey
    this.saveConfig()
  }

  getApiKey(provider: string): string | null {
    return this.config.apiKeys[provider] || null
  }

  getCurrentProvider(): AIProvider | null {
    return this.config.providers.find(p => p.id === this.config.currentProvider) || null
  }

  getCurrentModel(): string {
    return this.config.currentModel
  }

  setCurrentProvider(providerId: string, model?: string) {
    this.config.currentProvider = providerId
    const provider = this.getCurrentProvider()
    if (provider && provider.models.length > 0) {
      this.config.currentModel = model || provider.models[0]
    }
    this.saveConfig()
  }

  isConfigured(): boolean {
    const currentProvider = this.getCurrentProvider()
    return !!(currentProvider && this.getApiKey(currentProvider.id))
  }

  private saveConfig() {
    try {
      localStorage.setItem('ai_config', JSON.stringify(this.config))
    } catch (error) {
      console.error('保存AI配置失败:', error)
    }
  }

  private loadConfig() {
    try {
      const saved = localStorage.getItem('ai_config')
      if (saved) {
        const config = JSON.parse(saved)
        this.config = {
          ...this.config,
          ...config,
          providers: AI_PROVIDERS // 始终使用最新的provider配置
        }
      }
    } catch (error) {
      console.error('加载AI配置失败:', error)
    }
  }
}

export const aiConfigManager = new AIConfigManager()
