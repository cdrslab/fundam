// 全局配置类型定义
export interface ApiConfig {
  id: string
  name: string
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  description?: string
  params?: Record<string, any>
  headers?: Record<string, string>
}

export interface ModalConfig {
  id: string
  name: string
  title: string
  width?: number
  height?: number
  content?: string
}

export interface GlobalConfig {
  apis: ApiConfig[]
  modals: ModalConfig[]
  theme: {
    primaryColor: string
    borderRadius: number
  }
}

// 默认全局配置
export const defaultGlobalConfig: GlobalConfig = {
  apis: [
    {
      id: 'api_list_users',
      name: '获取用户列表',
      url: '/api/users',
      method: 'GET',
      description: '获取所有用户数据'
    },
    {
      id: 'api_create_user',
      name: '创建用户',
      url: '/api/users',
      method: 'POST',
      description: '创建新用户'
    },
    {
      id: 'api_update_user',
      name: '更新用户',
      url: '/api/users/:id',
      method: 'PUT',
      description: '更新用户信息'
    },
    {
      id: 'api_delete_user',
      name: '删除用户',
      url: '/api/users/:id',
      method: 'DELETE',
      description: '删除用户'
    }
  ],
  modals: [
    {
      id: 'modal_user_form',
      name: '用户表单弹窗',
      title: '用户信息',
      width: 600
    },
    {
      id: 'modal_confirm',
      name: '确认弹窗',
      title: '确认操作',
      width: 400
    }
  ],
  theme: {
    primaryColor: '#1890ff',
    borderRadius: 6
  }
}

// 全局配置管理类
class GlobalConfigManager {
  private config: GlobalConfig = defaultGlobalConfig

  getConfig(): GlobalConfig {
    return { ...this.config }
  }

  updateConfig(newConfig: Partial<GlobalConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  // API 管理
  addApi(api: ApiConfig): void {
    this.config.apis.push(api)
  }

  updateApi(id: string, api: Partial<ApiConfig>): void {
    const index = this.config.apis.findIndex(a => a.id === id)
    if (index !== -1) {
      this.config.apis[index] = { ...this.config.apis[index], ...api }
    }
  }

  deleteApi(id: string): void {
    this.config.apis = this.config.apis.filter(a => a.id !== id)
  }

  getApiById(id: string): ApiConfig | undefined {
    return this.config.apis.find(a => a.id === id)
  }

  // Modal 管理
  addModal(modal: ModalConfig): void {
    this.config.modals.push(modal)
  }

  updateModal(id: string, modal: Partial<ModalConfig>): void {
    const index = this.config.modals.findIndex(m => m.id === id)
    if (index !== -1) {
      this.config.modals[index] = { ...this.config.modals[index], ...modal }
    }
  }

  deleteModal(id: string): void {
    this.config.modals = this.config.modals.filter(m => m.id !== id)
  }

  getModalById(id: string): ModalConfig | undefined {
    return this.config.modals.find(m => m.id === id)
  }
}

export const globalConfigManager = new GlobalConfigManager()