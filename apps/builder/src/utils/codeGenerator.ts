import type { ComponentConfig } from '../types'

// 组件导入映射
const componentImports: Record<string, string> = {
  Button: 'antd',
  Input: 'antd',
  TextArea: 'antd',
  Select: 'antd',
  DatePicker: 'antd',
  Card: 'antd',
  Row: 'antd',
  Col: 'antd',
  Space: 'antd',
  Form: 'antd',
  Table: 'antd',
  PageListQuery: '@fundam/antd',
  ModalForm: '@fundam/antd'
}

// 递归收集所有组件类型（包括子组件）
const collectAllComponentTypes = (components: ComponentConfig[]): Set<string> => {
  const types = new Set<string>()

  const traverse = (componentList: ComponentConfig[]) => {
    componentList.forEach(component => {
      types.add(component.type)
      // 如果有子组件，递归处理
      if (component.children && component.children.length > 0) {
        traverse(component.children)
      }
    })
  }

  traverse(components)
  return types
}

// 生成导入语句
export const generateImports = (components: ComponentConfig[]): string => {
  const imports = new Map<string, Set<string>>()
  const allTypes = collectAllComponentTypes(components)

  allTypes.forEach(type => {
    const importFrom = componentImports[type]
    if (importFrom) {
      if (!imports.has(importFrom)) {
        imports.set(importFrom, new Set())
      }
      imports.get(importFrom)!.add(type)
    }
  })

  const importStatements = []

  // React导入
  importStatements.push("import React from 'react'")

  // 检查是否需要导入 ActionExecutor
  const hasButtonActions = components.some(comp =>
    comp.type === 'Button' && comp.props.actions && comp.props.actions.length > 0
  )

  // 特殊导入处理
  if (allTypes.has('TextArea')) {
    // TextArea 需要特殊导入
    const antdComponents = imports.get('antd')
    if (antdComponents) {
      antdComponents.delete('TextArea')
      const componentList = Array.from(antdComponents).sort().join(', ')
      if (componentList) {
        importStatements.push(`import { ${componentList} } from 'antd'`)
      }
      importStatements.push("const { TextArea } = Input")
    }
  } else {
    // 其他导入
    imports.forEach((componentSet, from) => {
      const componentList = Array.from(componentSet).sort().join(', ')
      if (componentList) {
        importStatements.push(`import { ${componentList} } from '${from}'`)
      }
    })
  }

  // 添加 ActionExecutor 导入（如果有按钮动作）
  if (hasButtonActions) {
    importStatements.push("import { ActionExecutor } from '../utils/actionExecutor'")
  }

  return importStatements.join('\n')
}

// 生成属性字符串
const generateProps = (props: Record<string, any>): string => {
  const propStrings = []

  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue

    if (key === 'children') {
      // children特殊处理，不作为prop
      continue
    }

    if (typeof value === 'boolean') {
      if (value) {
        propStrings.push(key)
      } else {
        propStrings.push(`${key}={false}`)
      }
    } else if (typeof value === 'string') {
      propStrings.push(`${key}="${value}"`)
    } else if (typeof value === 'number') {
      propStrings.push(`${key}={${value}}`)
    } else if (Array.isArray(value) || typeof value === 'object') {
      propStrings.push(`${key}={${JSON.stringify(value)}}`)
    } else {
      propStrings.push(`${key}={${JSON.stringify(value)}}`)
    }
  }

  return propStrings.length > 0 ? ' ' + propStrings.join(' ') : ''
}

// 生成单个组件的JSX
const generateComponentJSX = (component: ComponentConfig, indent: number = 0): string => {
  const indentStr = '  '.repeat(indent)
  const { type, props } = component

  const propsStr = generateProps(props)
  const children = props.children

  // 特殊组件处理
  if (type === 'PageListQuery') {
    return `${indentStr}<PageListQuery
${indentStr}  formItems={[]}
${indentStr}  tableProps={{
${indentStr}    columns: ${JSON.stringify(props.tableProps?.columns || [], null, 4).replace(/\n/g, '\n' + indentStr + '    ')},
${indentStr}    dataApi: "${props.tableProps?.dataApi || '/api/list'}"
${indentStr}  }}
${indentStr}/>`
  }

  if (type === 'ModalForm') {
    return `${indentStr}<ModalForm${propsStr}>
${indentStr}  {/* 在这里添加表单项 */}
${indentStr}</ModalForm>`
  }

  if (type === 'Form') {
    return `${indentStr}<Form${propsStr}>
${indentStr}  <Form.Item label="示例字段" name="example">
${indentStr}    <Input placeholder="这是一个示例表单项" />
${indentStr}  </Form.Item>
${indentStr}  <Form.Item>
${indentStr}    <Button type="primary">提交</Button>
${indentStr}  </Form.Item>
${indentStr}</Form>`
  }

  if (type === 'Table') {
    return `${indentStr}<Table${propsStr}
${indentStr}  columns={${JSON.stringify(props.columns || [], null, 2).replace(/\n/g, '\n' + indentStr + '  ')}}
${indentStr}  dataSource={[
${indentStr}    // 在这里添加数据
${indentStr}  ]}
${indentStr}/>`
  }

  // 按钮特殊处理
  if (type === 'Button' && props.actions && props.actions.length > 0) {
    const buttonProps = { ...props }
    delete buttonProps.actions // 移除actions属性，避免在props中显示

    return `${indentStr}<Button
${indentStr}  ${Object.entries(buttonProps).map(([key, value]) => 
      `${key}=${typeof value === 'string' ? `"${value}"` : `{${JSON.stringify(value)}}`}`
    ).join(`\n${indentStr}  `)}
${indentStr}  onClick={(e) => {
${indentStr}    // 执行配置的动作
${indentStr}    const actions = ${JSON.stringify(props.actions, null, 4).replace(/\n/g, '\n' + indentStr + '    ')}
${indentStr}    ActionExecutor.executeActions(actions, { buttonElement: e.currentTarget })
${indentStr}  }}
${indentStr}>
${indentStr}  ${props.children || '按钮'}
${indentStr}</Button>`
  }

  // 普通组件
  if (children) {
    if (typeof children === 'string') {
      return `${indentStr}<${type}${propsStr}>${children}</${type}>`
    } else {
      return `${indentStr}<${type}${propsStr}>
${indentStr}  {${JSON.stringify(children)}}
${indentStr}</${type}>`
    }
  } else {
    return `${indentStr}<${type}${propsStr} />`
  }
}

// 构建组件树结构
const buildComponentTree = (components: ComponentConfig[]): ComponentConfig[] => {
  const componentMap = new Map<string, ComponentConfig>()
  const rootComponents: ComponentConfig[] = []

  // 创建组件映射
  components.forEach(component => {
    componentMap.set(component.id, { ...component, children: [] })
  })

  // 构建父子关系
  components.forEach(component => {
    const comp = componentMap.get(component.id)!
    if (component.parentId) {
      const parent = componentMap.get(component.parentId)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(comp)
      }
    } else {
      rootComponents.push(comp)
    }
  })

  return rootComponents
}

// 递归生成组件JSX（支持嵌套）
const generateComponentTreeJSX = (components: ComponentConfig[], indent: number = 3): string => {
  return components.map(component => {
    const componentJSX = generateComponentJSX(component, indent)

    if (component.children && component.children.length > 0) {
      const childrenJSX = generateComponentTreeJSX(component.children, indent + 1)

      // 对于容器组件，将子组件嵌套在内部
      if (['Card', 'Row', 'Col', 'Space', 'Form'].includes(component.type)) {
        const indentStr = '  '.repeat(indent)

        return `${indentStr}<${component.type}${generateProps(component.props)}>
${childrenJSX}
${indentStr}</${component.type}>`
      }
    }

    return componentJSX
  }).join('\n\n')
}

// 生成完整的组件代码
export const generateComponentCode = (components: ComponentConfig[]): string => {
  if (components.length === 0) {
    return `import React from 'react'

const Page: React.FC = () => {
  return (
    <div>
      {/* 在这里添加组件 */}
    </div>
  )
}

export default Page`
  }

  const imports = generateImports(components)
  const componentTree = buildComponentTree(components)
  const componentJSX = generateComponentTreeJSX(componentTree, 3)

  return `${imports}

const Page: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
${componentJSX}
    </div>
  )
}

export default Page`
}

// 生成TypeScript接口定义
export const generateTypeDefinitions = (components: ComponentConfig[]): string => {
  const interfaces = new Set<string>()

  components.forEach(component => {
    if (component.type === 'Table' && component.props.columns) {
      interfaces.add(`interface TableItem {
  key: string
  ${component.props.columns.map((col: any) => `${col.dataIndex}: any`).join('\n  ')}
}`)
    }

    if (component.type === 'PageListQuery') {
      interfaces.add(`interface QueryParams {
  // 在这里定义查询参数类型
}

interface ListItem {
  // 在这里定义列表项类型
}`)
    }
  })

  return interfaces.size > 0 ? Array.from(interfaces).join('\n\n') + '\n\n' : ''
}

// 生成完整的页面代码（包含类型定义）
export const generateFullPageCode = (components: ComponentConfig[]): string => {
  const typeDefinitions = generateTypeDefinitions(components)
  const componentCode = generateComponentCode(components)

  if (typeDefinitions) {
    const lines = componentCode.split('\n')
    const importEndIndex = lines.findIndex(line => line.startsWith('const Page'))

    return [
      ...lines.slice(0, importEndIndex),
      typeDefinitions,
      ...lines.slice(importEndIndex)
    ].join('\n')
  }

  return componentCode
}
