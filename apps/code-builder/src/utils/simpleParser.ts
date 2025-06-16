import type { ComponentConfig, ComponentIdentity, NodePosition, EventConfig } from '../types'
import { v4 as uuidv4 } from 'uuid'

/**
 * 简化的代码解析器
 * 临时解决方案，避免Babel复杂导入问题
 */
export class SimpleParser {
  private sourceCode: string = ''

  constructor(code?: string) {
    if (code) {
      this.updateCode(code)
    }
  }

  updateCode(code: string): void {
    this.sourceCode = code
  }

  /**
   * 从代码中提取组件配置（简化实现）
   */
  extractComponents(): ComponentConfig[] {
    const components: ComponentConfig[] = []

    try {
      // 使用正则表达式简单解析JSX组件
      const componentRegex = /<(\w+)([^>]*?)(?:\/>|>[\s\S]*?<\/\1>)/g
      let match

      while ((match = componentRegex.exec(this.sourceCode)) !== null) {
        const componentType = match[1]
        const propsString = match[2]

        // 跳过HTML标签
        if (this.isHTMLTag(componentType)) {
          continue
        }

        const identity = this.generateComponentIdentity(componentType)
        const position = this.extractPosition(match.index)
        const props = this.extractPropsFromString(propsString)
        const events = this.extractEventsFromString(propsString)

        const config: ComponentConfig = {
          identity,
          position,
          props,
          events,
          isVisible: this.isComponentVisible(componentType, props)
        }

        components.push(config)
      }
    } catch (error) {
      console.error('Simple parser error:', error)
    }

    return components
  }

  private isHTMLTag(tagName: string): boolean {
    const htmlTags = [
      'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'a', 'img', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th',
      'form', 'input', 'textarea', 'select', 'option', 'button'
    ]
    return htmlTags.includes(tagName.toLowerCase())
  }

  private generateComponentIdentity(componentType: string): ComponentIdentity {
    const id = `${componentType.toLowerCase()}_${uuidv4().slice(0, 8)}`
    const name = this.getComponentDisplayName(componentType)

    return {
      id,
      name,
      type: componentType
    }
  }

  private getComponentDisplayName(componentType: string): string {
    const displayNames: Record<string, string> = {
      'PageListQuery': '列表页面',
      'FormItemInput': '输入框',
      'FormItemSelect': '下拉选择',
      'Button': '按钮',
      'Modal': '弹窗',
      'ModalForm': '模态框表单',
      'Form': '表单',
      'Table': '表格',
      'ProTable': '专业表格',
      'Card': '卡片',
      'Tabs': '标签页',
      'Collapse': '折叠面板'
    }
    return displayNames[componentType] || componentType
  }

  private extractPosition(index: number): NodePosition {
    const beforeText = this.sourceCode.slice(0, index)
    const lines = beforeText.split('\n')

    return {
      start: index,
      end: index + 50, // 简化实现
      line: lines.length,
      column: lines[lines.length - 1].length + 1
    }
  }

  private extractPropsFromString(propsString: string): Record<string, any> {
    const props: Record<string, any> = {}

    try {
      // 简单的props解析
      const propRegex = /(\w+)=(?:{([^}]+)}|"([^"]+)"|'([^']+)'|(\w+))/g
      let match

      while ((match = propRegex.exec(propsString)) !== null) {
        const propName = match[1]
        const jsValue = match[2]
        const stringValue = match[3] || match[4]
        const booleanValue = match[5]

        if (jsValue) {
          // JavaScript表达式
          try {
            // 尝试解析简单的JSON
            if (jsValue.startsWith('[') || jsValue.startsWith('{')) {
              props[propName] = JSON.parse(jsValue.replace(/'/g, '"'))
            } else if (jsValue === 'true') {
              props[propName] = true
            } else if (jsValue === 'false') {
              props[propName] = false
            } else if (!isNaN(Number(jsValue))) {
              props[propName] = Number(jsValue)
            } else {
              props[propName] = jsValue
            }
          } catch {
            props[propName] = jsValue
          }
        } else if (stringValue) {
          props[propName] = stringValue
        } else if (booleanValue) {
          props[propName] = true
        }
      }
    } catch (error) {
      console.warn('Props parsing error:', error)
    }

    return props
  }

  private extractEventsFromString(propsString: string): Record<string, EventConfig> {
    const events: Record<string, EventConfig> = {}

    try {
      const eventRegex = /(on\w+)=\{([^}]+)\}/g
      let match

      while ((match = eventRegex.exec(propsString)) !== null) {
        const eventType = match[1]
        const handler = match[2]

        events[eventType] = {
          type: eventType,
          handler,
          description: `${eventType} 事件处理器`
        }
      }
    } catch (error) {
      console.warn('Events parsing error:', error)
    }

    return events
  }

  private isComponentVisible(componentType: string, props: Record<string, any>): boolean {
    // 弹窗类组件默认不可见
    if (['Modal', 'ModalForm', 'Drawer', 'Popover', 'Tooltip'].includes(componentType)) {
      return props.visible === true || props.open === true
    }

    return true
  }

  /**
   * 获取当前代码
   */
  getCode(): string {
    return this.sourceCode
  }

  /**
   * 更新组件配置到代码（简化实现）
   */
  updateComponentInAST(componentId: string, newProps: Record<string, any>): string {
    // 简化实现：返回原代码
    // TODO: 实现真正的代码更新逻辑
    return this.sourceCode
  }

  /**
   * 格式化代码
   */
  formatCode(): string {
    // 简化实现：返回原代码
    return this.sourceCode
  }
}

export { SimpleParser as ASTParser }
