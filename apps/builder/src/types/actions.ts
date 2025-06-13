// 按钮动作类型定义
export interface ButtonAction {
  id: string
  type: 'modal' | 'api' | 'navigation' | 'form_submit' | 'table_refresh' | 'custom'
  config: Record<string, any>
}

// 弹窗动作配置
export interface ModalActionConfig {
  modalId: string
  data?: Record<string, any>
}

// API请求动作配置
export interface ApiActionConfig {
  apiId: string
  params?: Record<string, any>
  successMessage?: string
  errorMessage?: string
  onSuccess?: ButtonAction[] // 成功后执行的动作
  onError?: ButtonAction[] // 失败后执行的动作
}

// 表单提交动作配置
export interface FormSubmitActionConfig {
  formId?: string // 表单ID，如果不指定则查找最近的表单
  validateFirst?: boolean // 是否先验证表单
  apiId?: string // 提交到的API
  successActions?: ButtonAction[] // 成功后的动作
}

// 表格刷新动作配置
export interface TableRefreshActionConfig {
  tableId?: string // 表格ID，如果不指定则查找最近的表格
  collectFormData?: boolean // 是否收集表单数据作为查询参数
  formId?: string // 指定表单ID
}

// 导航动作配置
export interface NavigationActionConfig {
  type: 'push' | 'replace' | 'back'
  path?: string
  params?: Record<string, any>
}

// 自定义动作配置
export interface CustomActionConfig {
  code: string // JavaScript代码
}

// 动作模板定义
export interface ActionTemplate {
  type: ButtonAction['type']
  name: string
  description: string
  icon: string
  defaultConfig: Record<string, any>
  configSchema: ActionConfigSchema[]
}

// 配置项架构
export interface ActionConfigSchema {
  name: string
  label: string
  type: 'string' | 'select' | 'boolean' | 'number' | 'textarea' | 'api_select' | 'modal_select' | 'form_select' | 'table_select'
  required?: boolean
  options?: Array<{ label: string; value: any }>
  description?: string
  defaultValue?: any
}

// 动作模板配置
export const actionTemplates: ActionTemplate[] = [
  {
    type: 'modal',
    name: '打开弹窗',
    description: '打开指定的模态框',
    icon: 'modal',
    defaultConfig: {},
    configSchema: [
      {
        name: 'modalId',
        label: '目标弹窗',
        type: 'modal_select',
        required: true,
        description: '选择要打开的弹窗'
      },
      {
        name: 'data',
        label: '传递数据',
        type: 'textarea',
        description: '传递给弹窗的数据（JSON格式）'
      }
    ]
  },
  {
    type: 'api',
    name: 'API请求',
    description: '发送HTTP请求',
    icon: 'api',
    defaultConfig: {},
    configSchema: [
      {
        name: 'apiId',
        label: '接口',
        type: 'api_select',
        required: true,
        description: '选择要调用的API接口'
      },
      {
        name: 'params',
        label: '请求参数',
        type: 'textarea',
        description: '请求参数（JSON格式）'
      },
      {
        name: 'successMessage',
        label: '成功提示',
        type: 'string',
        description: '请求成功时的提示信息'
      },
      {
        name: 'errorMessage',
        label: '失败提示',
        type: 'string',
        description: '请求失败时的提示信息'
      }
    ]
  },
  {
    type: 'form_submit',
    name: '表单提交',
    description: '提交表单数据',
    icon: 'form',
    defaultConfig: {
      validateFirst: true
    },
    configSchema: [
      {
        name: 'formId',
        label: '目标表单',
        type: 'form_select',
        description: '选择要提交的表单（留空则自动查找）'
      },
      {
        name: 'validateFirst',
        label: '先验证表单',
        type: 'boolean',
        defaultValue: true,
        description: '提交前是否先验证表单'
      },
      {
        name: 'apiId',
        label: '提交接口',
        type: 'api_select',
        description: '选择提交数据的API接口'
      }
    ]
  },
  {
    type: 'table_refresh',
    name: '刷新表格',
    description: '刷新表格数据',
    icon: 'table',
    defaultConfig: {
      collectFormData: true
    },
    configSchema: [
      {
        name: 'tableId',
        label: '目标表格',
        type: 'table_select',
        description: '选择要刷新的表格（留空则自动查找）'
      },
      {
        name: 'collectFormData',
        label: '收集表单数据',
        type: 'boolean',
        defaultValue: true,
        description: '是否将表单数据作为查询参数'
      },
      {
        name: 'formId',
        label: '数据来源表单',
        type: 'form_select',
        description: '指定收集数据的表单（留空则自动查找）'
      }
    ]
  },
  {
    type: 'navigation',
    name: '页面跳转',
    description: '跳转到其他页面',
    icon: 'navigation',
    defaultConfig: {
      type: 'push'
    },
    configSchema: [
      {
        name: 'type',
        label: '跳转方式',
        type: 'select',
        defaultValue: 'push',
        options: [
          { label: '新增历史记录', value: 'push' },
          { label: '替换当前页面', value: 'replace' },
          { label: '返回上一页', value: 'back' }
        ]
      },
      {
        name: 'path',
        label: '目标路径',
        type: 'string',
        description: '要跳转的页面路径'
      },
      {
        name: 'params',
        label: '路径参数',
        type: 'textarea',
        description: '传递的参数（JSON格式）'
      }
    ]
  },
  {
    type: 'custom',
    name: '自定义代码',
    description: '执行自定义JavaScript代码',
    icon: 'code',
    defaultConfig: {},
    configSchema: [
      {
        name: 'code',
        label: 'JavaScript代码',
        type: 'textarea',
        required: true,
        description: '要执行的JavaScript代码'
      }
    ]
  }
]