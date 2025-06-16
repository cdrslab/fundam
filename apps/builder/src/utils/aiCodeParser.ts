import { ComponentConfig } from '../types'
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
  
  // 尝试提取formItems中的表单项
  const formItemsMatch = code.match(/formItems=\{[\s\S]*?\}/s)
  if (formItemsMatch) {
    // 这里可以进一步解析表单项
    props.hasSearchForm = true
  }
  
  // 尝试提取tableProps
  const tablePropsMatch = code.match(/tableProps=\{\{[\s\S]*?\}\}/s)
  if (tablePropsMatch) {
    props.hasTable = true
    
    // 提取columns信息
    const columnsMatch = tablePropsMatch[0].match(/columns:\s*\[([\s\S]*?)\]/s)
    if (columnsMatch) {
      props.tableColumns = extractTableColumns(columnsMatch[1])
    }
  }
  
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

function extractTableColumns(columnsStr: string): any[] {
  const columns: any[] = []
  
  try {
    // 简单的列信息提取
    const columnMatches = columnsStr.match(/\{\s*title:\s*['"]([^'"]*)['"]\s*,\s*dataIndex:\s*['"]([^'"]*)['"]\s*\}/g)
    
    if (columnMatches) {
      columnMatches.forEach(match => {
        const titleMatch = match.match(/title:\s*['"]([^'"]*)['"]/);
        const dataIndexMatch = match.match(/dataIndex:\s*['"]([^'"]*)['"]/);
        
        if (titleMatch && dataIndexMatch) {
          columns.push({
            title: titleMatch[1],
            dataIndex: dataIndexMatch[1]
          })
        }
      })
    }
  } catch (e) {
    console.warn('解析表格列失败:', e)
  }
  
  return columns
}