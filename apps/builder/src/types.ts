// 组件配置类型
export interface ComponentConfig {
  id: string
  type: string
  name: string
  icon?: string
  props: Record<string, any>
  children?: ComponentConfig[]
  parentId?: string
}

// 组件定义类型
export interface ComponentDefinition {
  type: string
  name: string
  icon?: string
  category: string
  defaultProps: Record<string, any>
  propTypes: PropTypeDefinition[]
  preview?: string
  isContainer?: boolean // 是否为容器组件，可包含子组件
}

// 拖拽位置类型
export interface DropPosition {
  type: 'before' | 'after' | 'inside'
  targetId: string
  targetIndex?: number
}

// 属性类型定义
export interface PropTypeDefinition {
  name: string
  type: 'string' | 'number' | 'boolean' | 'select' | 'color' | 'textarea' | 'json' | 'tabs_config' | 'collapse_config'
  label: string
  defaultValue?: any
  options?: Array<{ label: string; value: any }>
  description?: string
}

// 拖拽项目类型
export interface DragItem {
  type: string
  componentType: string
  componentId?: string
  component?: ComponentConfig
}

// 画布状态类型
export interface CanvasState {
  components: ComponentConfig[]
  selectedId: string | null
}

// AI消息类型
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  code?: string // AI生成的代码
}