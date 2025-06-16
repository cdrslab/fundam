export interface AIProvider {
  id: string
  name: string
  baseUrl: string
  models: string[]
  requiresKey: boolean
}

export interface AIConfig {
  currentProvider: string
  currentModel: string
  temperature: number
  maxTokens: number
  apiKeys: Record<string, string>
}

// 支持的AI提供商
export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    requiresKey: true
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    models: ['deepseek-chat', 'deepseek-coder'],
    requiresKey: true
  },
  {
    id: 'custom',
    name: '自定义',
    baseUrl: '',
    models: [],
    requiresKey: true
  }
]

const STORAGE_KEY = 'fundam-code-builder-ai-config'

class AIConfigManager {
  private config: AIConfig

  constructor() {
    this.config = this.loadConfig()
  }

  private loadConfig(): AIConfig {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (error) {
        console.warn('Failed to parse AI config:', error)
      }
    }
    
    return this.getDefaultConfig()
  }

  private getDefaultConfig(): AIConfig {
    return {
      currentProvider: 'openai',
      currentModel: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 2000,
      apiKeys: {}
    }
  }

  private saveConfig(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config))
  }

  getConfig(): AIConfig {
    return { ...this.config }
  }

  updateConfig(updates: Partial<AIConfig>): void {
    this.config = { ...this.config, ...updates }
    this.saveConfig()
  }

  setApiKey(providerId: string, apiKey: string): void {
    this.config.apiKeys[providerId] = apiKey
    this.saveConfig()
  }

  getApiKey(providerId: string): string | undefined {
    return this.config.apiKeys[providerId]
  }

  getCurrentProvider(): AIProvider | undefined {
    return AI_PROVIDERS.find(p => p.id === this.config.currentProvider)
  }

  getCurrentModel(): string {
    return this.config.currentModel
  }

  isConfigured(): boolean {
    const provider = this.getCurrentProvider()
    if (!provider) return false
    
    if (provider.requiresKey) {
      const apiKey = this.getApiKey(provider.id)
      return !!(apiKey && apiKey.trim())
    }
    
    return true
  }

  testConnection = async (): Promise<{ success: boolean; message: string }> => {
    const provider = this.getCurrentProvider()
    if (!provider) {
      return { success: false, message: '未选择AI提供商' }
    }

    if (!this.isConfigured()) {
      return { success: false, message: '请先配置API Key' }
    }

    try {
      const apiKey = this.getApiKey(provider.id)
      const response = await fetch(`${provider.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: this.config.currentModel,
          messages: [{ role: 'user', content: '测试连接' }],
          max_tokens: 10
        })
      })

      if (response.ok) {
        return { success: true, message: '连接成功' }
      } else {
        const errorData = await response.json().catch(() => ({}))
        return { 
          success: false, 
          message: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}` 
        }
      }
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : '连接失败' 
      }
    }
  }

  setProvider(providerId: string, model?: string): void {
    const provider = AI_PROVIDERS.find(p => p.id === providerId)
    if (!provider) return

    this.config.currentProvider = providerId
    
    if (model && provider.models.includes(model)) {
      this.config.currentModel = model
    } else if (provider.models.length > 0) {
      this.config.currentModel = provider.models[0]
    }
    
    this.saveConfig()
  }

  setModel(model: string): void {
    const provider = this.getCurrentProvider()
    if (provider && provider.models.includes(model)) {
      this.config.currentModel = model
      this.saveConfig()
    }
  }

  setTemperature(temperature: number): void {
    this.config.temperature = Math.max(0, Math.min(2, temperature))
    this.saveConfig()
  }

  setMaxTokens(maxTokens: number): void {
    this.config.maxTokens = Math.max(1, Math.min(8000, maxTokens))
    this.saveConfig()
  }

  clearApiKey(providerId: string): void {
    delete this.config.apiKeys[providerId]
    this.saveConfig()
  }

  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEY)
    this.config = this.getDefaultConfig()
  }
}

export const aiConfigManager = new AIConfigManager()