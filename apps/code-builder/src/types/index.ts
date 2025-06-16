// 组件唯一标识和命名系统
export interface ComponentIdentity {
  id: string // 全局唯一ID，如：user_list_filter_form_username
  name: string // 用户友好名称，如：用户列表筛选表单-用户名
  type: string // 组件类型，如：FormItemInput
  parentId?: string // 父组件ID
  children?: string[] // 子组件ID列表
}

// 全局配置接口
export interface GlobalConfig {
  // API接口配置
  apis: Record<string, ApiConfig>
  // 全局变量
  variables: Record<string, VariableConfig>
  // 路由参数
  routeParams: string[]
  // 查询参数
  queryParams: string[]
}

export interface ApiConfig {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  description?: string
  params?: Record<string, any>
  headers?: Record<string, string>
}

export interface VariableConfig {
  name: string
  type: 'state' | 'ref' | 'computed'
  defaultValue?: any
  description?: string
}

// AST节点位置信息
export interface NodePosition {
  start: number
  end: number
  line: number
  column: number
}

// 组件配置（从AST解析获得）
export interface ComponentConfig {
  identity: ComponentIdentity
  position: NodePosition
  props: Record<string, any>
  events: Record<string, EventConfig>
  isVisible: boolean // 用于弹窗等隐藏组件的可见性控制
  aiSummary?: string // AI生成的组件功能总结
}

export interface EventConfig {
  type: string // 事件类型，如：onClick, onChange
  handler: string // 处理函数代码
  description?: string // AI生成的事件描述
}

// AI对话消息
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  componentId?: string // 关联的组件ID
  changes?: CodeChange[] // 本次对话产生的代码变更
}

export interface CodeChange {
  type: 'create' | 'update' | 'delete'
  target: 'component' | 'api' | 'variable'
  targetId: string
  before?: string
  after?: string
  description: string
}

// 代码生成模板
export interface CodeTemplate {
  // 固定的全局变量和方法模板
  globals: string
  // 页面组件模板
  pageTemplate: string
  // 导入语句模板
  imports: string
}

// 组件选择器状态
export interface ComponentSelector {
  selectedId: string | null
  hoveredId: string | null
  expandedIds: string[] // 展开的组件树节点
}

// 编辑器状态
export interface EditorState {
  code: string
  selectedComponentId: string | null
  isCodeView: boolean // 是否显示代码视图
  isDirty: boolean // 是否有未保存的修改
}