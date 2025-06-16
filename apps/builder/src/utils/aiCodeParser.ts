import type { ComponentConfig } from '../types'
import { generateId } from './helpers'

/**
 * 解析AI生成的代码，转换为可编辑的组件配置
 */
export function parseAiCodeToComponents(code: string): ComponentConfig[] {
  const components: ComponentConfig[] = []

  try {
    // 简化的代码解析 - 识别常见的Fundam组件模式
    const patterns = [
      // PageListQuery 组件
      {
        regex: /<PageListQuery[\s\S]*?\/>/g,
        type: 'PageListQuery',
        parser: parsePageListQuery
      },
      // ModalForm 组件
      {
        regex: /<ModalForm[\s\S]*?>[\s\S]*?<\/ModalForm>/g,
        type: 'ModalForm',
        parser: parseModalForm
      },
      // Card 组件
      {
        regex: /<Card[\s\S]*?>[\s\S]*?<\/Card>/g,
        type: 'Card',
        parser: parseCard
      },
      // FormItemInput 组件
      {
        regex: /<FormItemInput[^>]*\/>/g,
        type: 'FormItemInput',
        parser: parseFormItemInput
      },
      // FormItemSelect 组件
      {
        regex: /<FormItemSelect[\s\S]*?\/>/g,
        type: 'FormItemSelect',
        parser: parseFormItemSelect
      },
      // Button 组件
      {
        regex: /<Button[^>]*>[\s\S]*?<\/Button>/g,
        type: 'Button',
        parser: parseButton
      }
    ]

    patterns.forEach(pattern => {
      const matches = code.match(pattern.regex)
      if (matches) {
        matches.forEach(match => {
          const component = pattern.parser(match)
          if (component) {
            components.push(component)
          }
        })
      }
    })

    return components
  } catch (error) {
    console.error('解析AI代码失败:', error)
    return []
  }
}

function parsePageListQuery(code: string): ComponentConfig | null {
  const id = generateId()

  // 提取基本属性
  const props: any = {
    title: '列表页面'
  }

  // 首先查找columns变量定义，这是更可靠的方法
  const columnsVarMatch = code.match(/const\s+columns\s*=\s*\[([\s\S]*?)\]/s)
  if (columnsVarMatch) {
    const columnsContent = columnsVarMatch[1]
    const parsedColumns = parseColumnsFromCode(columnsContent)

    if (parsedColumns.length > 0) {
      props.tableProps = {
        columns: parsedColumns
      }
    }
  } else {
    // 如果没有找到columns变量，尝试在tableProps中直接查找
    const tablePropsMatch = code.match(/tableProps=\{\{([\s\S]*?)\}\}/s)
    if (tablePropsMatch) {
      const tablePropsContent = tablePropsMatch[1]

      // 处理columns引用 - 如果是变量引用，查找变量定义
      if (tablePropsContent.includes('columns,') || tablePropsContent.includes('columns ')) {
        const columnsRefMatch = code.match(/const\s+columns\s*=\s*\[([\s\S]*?)\]/s)
        if (columnsRefMatch) {
          const parsedColumns = parseColumnsFromCode(columnsRefMatch[1])
          if (parsedColumns.length > 0) {
            if (!props.tableProps) props.tableProps = {}
            props.tableProps.columns = parsedColumns
          }
        }
      } else {
        // 直接在tableProps中查找columns数组
        const directColumnsMatch = tablePropsContent.match(/columns:\s*\[([\s\S]*?)\]/s)
        if (directColumnsMatch) {
          const parsedColumns = parseColumnsFromCode(directColumnsMatch[1])
          if (parsedColumns.length > 0) {
            props.tableProps = { columns: parsedColumns }
          }
        }
      }
    }
  }

  // 提取mockData数据源
  const dataSourceMatch = code.match(/const\s+mockData\s*=\s*\[([\s\S]*?)\]/s)
  if (dataSourceMatch) {
    try {
      const dataSourceStr = '[' + dataSourceMatch[1] + ']'
        .replace(/'/g, '"')
        .replace(/(\w+):/g, '"$1":')
        .replace(/,\s*}/g, '}') // 移除对象末尾的多余逗号
        .replace(/,\s*]/g, ']') // 移除数组末尾的多余逗号
      const dataSource = JSON.parse(dataSourceStr)
      if (!props.tableProps) props.tableProps = {}
      props.tableProps.dataSource = dataSource
      console.log('解析到dataSource:', dataSource)
    } catch (e) {
      console.warn('解析dataSource失败:', e, '原始内容:', dataSourceMatch[1])
    }
  }

  // 如果tableProps中有dataSource引用，确保关联
  const tablePropsMatch = code.match(/tableProps=\{\{([\s\S]*?)\}\}/s)
  if (tablePropsMatch && tablePropsMatch[1].includes('dataSource: mockData')) {
    // 确保dataSource已经被解析并且添加到tableProps中
    const existingDataSource = props.tableProps?.dataSource
    if (existingDataSource) {
      if (!props.tableProps) props.tableProps = {}
      props.tableProps.dataSource = existingDataSource
    }
  }

  // 提取formItems - 处理JSX片段格式
  const formItemsMatch = code.match(/formItems=\{\s*<>\s*([\s\S]*?)\s*<\/>\s*\}/s)
  if (formItemsMatch) {
    const formItemsContent = formItemsMatch[1]
    props.formItems = parseFormItemsFromCode(formItemsContent)
    console.log('解析formItems:', props.formItems)
  }

  console.log('解析PageListQuery完成:', {
    找到列定义: !!columnsVarMatch,
    解析的列数: props.tableProps?.columns?.length || 0,
    列信息: props.tableProps?.columns
  })

  return {
    id,
    type: 'PageListQuery',
    name: 'PageListQuery',
    props
  }
}

function parseModalForm(code: string): ComponentConfig | null {
  const id = generateId()

  const props: any = {
    title: '表单弹窗',
    visible: false
  }

  // 提取title
  const titleMatch = code.match(/title=["']([^"']*)["']/)
  if (titleMatch) {
    props.title = titleMatch[1]
  }

  return {
    id,
    type: 'ModalForm',
    name: 'ModalForm',
    props
  }
}

function parseCard(code: string): ComponentConfig | null {
  const id = generateId()

  const props: any = {
    title: '卡片'
  }

  // 提取title
  const titleMatch = code.match(/title=["']([^"']*)["']/)
  if (titleMatch) {
    props.title = titleMatch[1]
  }

  return {
    id,
    type: 'Card',
    name: 'Card',
    props
  }
}

function parseFormItemInput(code: string): ComponentConfig | null {
  const id = generateId()

  const props: any = {}

  // 提取name
  const nameMatch = code.match(/name=["']([^"']*)["']/)
  if (nameMatch) {
    props.name = nameMatch[1]
  }

  // 提取label
  const labelMatch = code.match(/label=["']([^"']*)["']/)
  if (labelMatch) {
    props.label = labelMatch[1]
  }

  // 提取placeholder
  const placeholderMatch = code.match(/placeholder=["']([^"']*)["']/)
  if (placeholderMatch) {
    props.placeholder = placeholderMatch[1]
  }

  // 提取required
  const requiredMatch = code.match(/required(?:=\{?true\}?)?/)
  if (requiredMatch) {
    props.required = true
  }

  return {
    id,
    type: 'FormItemInput',
    name: 'FormItemInput',
    props
  }
}

function parseFormItemSelect(code: string): ComponentConfig | null {
  const id = generateId()

  const props: any = {}

  // 提取name
  const nameMatch = code.match(/name=["']([^"']*)["']/)
  if (nameMatch) {
    props.name = nameMatch[1]
  }

  // 提取label
  const labelMatch = code.match(/label=["']([^"']*)["']/)
  if (labelMatch) {
    props.label = labelMatch[1]
  }

  // 提取options
  const optionsMatch = code.match(/options=\{(\[[\s\S]*?\])\}/)
  if (optionsMatch) {
    try {
      // 简单解析options数组
      const optionsStr = optionsMatch[1]
        .replace(/'/g, '"')
        .replace(/(\w+):/g, '"$1":')
      props.options = JSON.parse(optionsStr)
    } catch (e) {
      console.warn('解析options失败:', e)
    }
  }

  return {
    id,
    type: 'FormItemSelect',
    name: 'FormItemSelect',
    props
  }
}

function parseButton(code: string): ComponentConfig | null {
  const id = generateId()

  const props: any = {
    children: '按钮'
  }

  // 提取type
  const typeMatch = code.match(/type=["']([^"']*)["']/)
  if (typeMatch) {
    props.type = typeMatch[1]
  }

  // 提取文本内容
  const textMatch = code.match(/>([^<]+)</);
  if (textMatch) {
    props.children = textMatch[1].trim()
  }

  return {
    id,
    type: 'Button',
    name: 'Button',
    props
  }
}

function parseColumnsFromCode(columnsContent: string): any[] {
  const columns: any[] = []

  try {
    // 首先尝试更宽松的列对象匹配，处理各种格式
    // 匹配 { title: 'xxx', dataIndex: 'yyy' } 格式
    const simpleColumnRegex = /\{\s*title:\s*['"]([^'"]*)['"]\s*,\s*dataIndex:\s*['"]([^'"]*)['"]\s*(?:,[\s\S]*?)?\}/g
    let match

    while ((match = simpleColumnRegex.exec(columnsContent)) !== null) {
      const column = {
        title: match[1],
        dataIndex: match[2]
      }
      columns.push(column)
      console.log('解析到列:', column)
    }

    // 处理操作列或没有dataIndex的列
    const actionColumnRegex = /\{\s*title:\s*['"]([^'"]*)['"]\s*,\s*(?:key:\s*['"]([^'"]*)['"]\s*,\s*)?render:\s*\([^)]*\)\s*=>/g
    let actionMatch

    while ((actionMatch = actionColumnRegex.exec(columnsContent)) !== null) {
      const actionColumn = {
        title: actionMatch[1],
        dataIndex: actionMatch[2] || 'action',
        render: 'action' // 标记为操作列
      }

      // 避免重复添加已存在的列
      if (!columns.find(col => col.title === actionColumn.title)) {
        columns.push(actionColumn)
        console.log('解析到操作列:', actionColumn)
      }
    }

    // 如果没有解析到任何列，尝试更宽松的匹配
    if (columns.length === 0) {
      console.log('未解析到列，尝试宽松匹配，原始内容:', columnsContent)

      // 提取所有可能的title字段
      const titleMatches = columnsContent.match(/title:\s*['"]([^'"]*)['"]/g)
      const dataIndexMatches = columnsContent.match(/dataIndex:\s*['"]([^'"]*)['"]/g)

      if (titleMatches && dataIndexMatches && titleMatches.length === dataIndexMatches.length) {
        for (let i = 0; i < titleMatches.length; i++) {
          const title = titleMatches[i].match(/title:\s*['"]([^'"]*)['"]/)?.[1]
          const dataIndex = dataIndexMatches[i].match(/dataIndex:\s*['"]([^'"]*)['"]/)?.[1]

          if (title && dataIndex) {
            columns.push({ title, dataIndex })
            console.log('宽松匹配到列:', { title, dataIndex })
          }
        }
      }
    }

  } catch (e) {
    console.warn('解析columns失败:', e)
  }

  console.log('最终解析的columns:', columns)
  return columns
}

function parseFormItemsFromCode(formItemsContent: string): any[] {
  const formItems: any[] = []

  try {
    console.log('解析formItems内容:', formItemsContent)

    // 提取FormItemInput - 支持自闭合标签
    const inputMatches = formItemsContent.match(/<FormItemInput[^>]*\/?>/g)
    if (inputMatches) {
      inputMatches.forEach(match => {
        const nameMatch = match.match(/name=["']([^"']*)["']/)
        const labelMatch = match.match(/label=["']([^"']*)["']/)
        const requiredMatch = match.match(/required(?:=\{?true\}?)?/)

        if (nameMatch && labelMatch) {
          const item = {
            type: 'FormItemInput',
            name: nameMatch[1],
            label: labelMatch[1]
          }
          if (requiredMatch) {
            item.required = true
          }
          formItems.push(item)
          console.log('解析到FormItemInput:', item)
        }
      })
    }

    // 提取FormItemSelect - 支持多行options
    const selectMatches = formItemsContent.match(/<FormItemSelect[\s\S]*?(?:\/>|<\/FormItemSelect>)/g)
    if (selectMatches) {
      selectMatches.forEach(match => {
        const nameMatch = match.match(/name=["']([^"']*)["']/)
        const labelMatch = match.match(/label=["']([^"']*)["']/)
        const requiredMatch = match.match(/required(?:=\{?true\}?)?/)

        // 提取options数组 - 支持多行格式
        const optionsMatch = match.match(/options=\{(\[[\s\S]*?\])\}/)

        if (nameMatch && labelMatch) {
          const item: any = {
            type: 'FormItemSelect',
            name: nameMatch[1],
            label: labelMatch[1]
          }

          if (requiredMatch) {
            item.required = true
          }

          if (optionsMatch) {
            try {
              const optionsStr = optionsMatch[1]
                .replace(/'/g, '"')
                .replace(/(\w+):/g, '"$1":')
                .replace(/,\s*}/g, '}') // 移除对象末尾的多余逗号
              item.options = JSON.parse(optionsStr)
              console.log('解析到FormItemSelect options:', item.options)
            } catch (e) {
              console.warn('解析select options失败:', e, '原始字符串:', optionsMatch[1])
            }
          }

          formItems.push(item)
          console.log('解析到FormItemSelect:', item)
        }
      })
    }
  } catch (e) {
    console.warn('解析formItems失败:', e)
  }

  return formItems
}

function extractTableColumns(columnsStr: string): any[] {
  // 保留原有函数作为后备
  return parseColumnsFromCode(columnsStr)
}
