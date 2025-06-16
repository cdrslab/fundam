import { parse, type ParseResult } from '@babel/parser'
import traverse from '@babel/traverse'
import generate from '@babel/generator'
import * as t from '@babel/types'
import { v4 as uuidv4 } from 'uuid'
import type { ComponentConfig, ComponentIdentity, NodePosition, EventConfig } from '../types'

/**
 * AST解析器 - 核心功能
 * 负责代码与配置的双向绑定
 */
export class ASTParser {
  private ast: ParseResult<t.File> | null = null
  private sourceCode: string = ''

  constructor(code?: string) {
    if (code) {
      this.updateCode(code)
    }
  }

  /**
   * 更新源代码并重新解析AST
   */
  updateCode(code: string): void {
    this.sourceCode = code
    try {
      this.ast = parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript', 'decorators-legacy']
      })
    } catch (error) {
      console.error('AST解析失败:', error)
      this.ast = null
    }
  }

  /**
   * 从AST中提取所有组件配置
   */
  extractComponents(): ComponentConfig[] {
    if (!this.ast) return []

    const components: ComponentConfig[] = []
    const componentStack: { id: string; name: string }[] = []

    const traverseFunc = traverse.default || traverse;
    traverseFunc(this.ast, {
      JSXElement: (path) => {
        const element = path.node
        const opening = element.openingElement

        if (t.isJSXIdentifier(opening.name)) {
          const componentType = opening.name.name

          // 生成组件身份信息
          const identity = this.generateComponentIdentity(componentType, componentStack)

          // 提取位置信息
          const position = this.extractNodePosition(element)

          // 提取props
          const props = this.extractJSXProps(opening.attributes)

          // 提取事件处理器
          const events = this.extractEventHandlers(opening.attributes)

          // 判断组件是否可见（用于弹窗等隐藏组件）
          const isVisible = this.isComponentVisible(componentType, props)

          const config: ComponentConfig = {
            identity,
            position,
            props,
            events,
            isVisible
          }

          components.push(config)

          // 进入子组件时更新堆栈
          componentStack.push({ id: identity.id, name: identity.name })
        }
      },

      'JSXElement|exit': (path) => {
        // 退出时弹出堆栈
        if (componentStack.length > 0) {
          componentStack.pop()
        }
      }
    })

    return components
  }

  /**
   * 生成组件唯一标识
   */
  private generateComponentIdentity(
    componentType: string,
    parentStack: { id: string; name: string }[]
  ): ComponentIdentity {
    // 基于父组件路径生成有意义的ID
    const parentPath = parentStack.map(p => p.name).join('_')
    const baseId = parentPath ? `${parentPath}_${componentType}` : componentType

    // 转换为合法的变量名格式
    const id = this.sanitizeId(baseId) + '_' + uuidv4().slice(0, 8)

    // 生成用户友好的名称
    const parentName = parentStack.length > 0 ? parentStack[parentStack.length - 1].name : ''
    const name = parentName ? `${parentName}-${this.getComponentDisplayName(componentType)}` : this.getComponentDisplayName(componentType)

    return {
      id,
      name,
      type: componentType,
      parentId: parentStack.length > 0 ? parentStack[parentStack.length - 1].id : undefined
    }
  }

  /**
   * 清理ID使其成为合法的标识符
   */
  private sanitizeId(id: string): string {
    return id
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/^[0-9]/, '_$&')
      .replace(/_+/g, '_')
  }

  /**
   * 获取组件的显示名称
   */
  private getComponentDisplayName(componentType: string): string {
    const displayNames: Record<string, string> = {
      'PageListQuery': '列表页面',
      'FormItemInput': '输入框',
      'FormItemSelect': '下拉选择',
      'Button': '按钮',
      'Modal': '弹窗',
      'Form': '表单',
      'Table': '表格',
      'Card': '卡片',
      'Tabs': '标签页',
      'TabPane': '标签面板'
    }
    return displayNames[componentType] || componentType
  }

  /**
   * 提取节点位置信息
   */
  private extractNodePosition(node: t.Node): NodePosition {
    return {
      start: node.start || 0,
      end: node.end || 0,
      line: node.loc?.start?.line || 0,
      column: node.loc?.start?.column || 0
    }
  }

  /**
   * 提取JSX属性
   */
  private extractJSXProps(attributes: (t.JSXAttribute | t.JSXSpreadAttribute)[]): Record<string, any> {
    const props: Record<string, any> = {}

    attributes.forEach(attr => {
      if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
        const propName = attr.name.name
        const propValue = this.extractJSXAttributeValue(attr.value)
        props[propName] = propValue
      }
    })

    return props
  }

  /**
   * 提取JSX属性值
   */
  private extractJSXAttributeValue(value: t.JSXAttribute['value']): any {
    if (!value) return true

    if (t.isStringLiteral(value)) {
      return value.value
    }

    if (t.isJSXExpressionContainer(value)) {
      const expression = value.expression

      if (t.isStringLiteral(expression) || t.isNumericLiteral(expression) || t.isBooleanLiteral(expression)) {
        return expression.value
      }

      if (t.isArrayExpression(expression)) {
        return this.extractArrayExpression(expression)
      }

      if (t.isObjectExpression(expression)) {
        return this.extractObjectExpression(expression)
      }

      // 对于复杂表达式，返回代码字符串
      const generateFunc = generate.default || generate;
      return generateFunc(expression).code
    }

    return null
  }

  /**
   * 提取数组表达式
   */
  private extractArrayExpression(node: t.ArrayExpression): any[] {
    return node.elements.map(element => {
      if (!element) return null

      if (t.isStringLiteral(element) || t.isNumericLiteral(element) || t.isBooleanLiteral(element)) {
        return element.value
      }

      if (t.isObjectExpression(element)) {
        return this.extractObjectExpression(element)
      }

      return generate(element).code
    })
  }

  /**
   * 提取对象表达式
   */
  private extractObjectExpression(node: t.ObjectExpression): Record<string, any> {
    const obj: Record<string, any> = {}

    node.properties.forEach(prop => {
      if (t.isObjectProperty(prop) && !prop.computed) {
        let key: string = ''

        if (t.isIdentifier(prop.key)) {
          key = prop.key.name
        } else if (t.isStringLiteral(prop.key)) {
          key = prop.key.value
        }

        if (key) {
          if (t.isStringLiteral(prop.value) || t.isNumericLiteral(prop.value) || t.isBooleanLiteral(prop.value)) {
            obj[key] = prop.value.value
          } else {
            obj[key] = generate(prop.value).code
          }
        }
      }
    })

    return obj
  }

  /**
   * 提取事件处理器
   */
  private extractEventHandlers(attributes: (t.JSXAttribute | t.JSXSpreadAttribute)[]): Record<string, EventConfig> {
    const events: Record<string, EventConfig> = {}

    attributes.forEach(attr => {
      if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
        const propName = attr.name.name

        // 检查是否为事件属性
        if (propName.startsWith('on') && attr.value && t.isJSXExpressionContainer(attr.value)) {
          const handler = generate(attr.value.expression).code

          events[propName] = {
            type: propName,
            handler
          }
        }
      }
    })

    return events
  }

  /**
   * 判断组件是否可见
   */
  private isComponentVisible(componentType: string, props: Record<string, any>): boolean {
    // 弹窗类组件默认不可见
    if (['Modal', 'Drawer', 'Popover', 'Tooltip'].includes(componentType)) {
      return props.visible === true || props.open === true
    }

    // Tab面板需要检查是否为当前激活的面板
    if (componentType === 'TabPane') {
      return true // 暂时都设为可见，具体逻辑由组件树处理
    }

    return true
  }

  /**
   * 更新组件配置到AST
   */
  updateComponentInAST(componentId: string, newProps: Record<string, any>): string {
    if (!this.ast) return this.sourceCode

    // 这里需要实现具体的AST更新逻辑
    // 通过componentId找到对应的AST节点，更新其属性

    // 临时实现：直接返回原代码
    // TODO: 实现完整的AST更新逻辑

    return generate(this.ast).code
  }

  /**
   * 在指定位置插入新组件
   */
  insertComponent(parentId: string, componentCode: string, position?: 'before' | 'after' | 'inside'): string {
    if (!this.ast) return this.sourceCode

    // TODO: 实现组件插入逻辑

    return generate(this.ast).code
  }

  /**
   * 删除组件
   */
  removeComponent(componentId: string): string {
    if (!this.ast) return this.sourceCode

    // TODO: 实现组件删除逻辑

    return generate(this.ast).code
  }

  /**
   * 获取当前代码
   */
  getCode(): string {
    if (!this.ast) return this.sourceCode
    return generate(this.ast).code
  }

  /**
   * 格式化代码
   */
  formatCode(): string {
    if (!this.ast) return this.sourceCode

    return generate(this.ast, {
      retainLines: false,
      compact: false
    }).code
  }
}
