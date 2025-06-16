import type { CodeTemplate, GlobalConfig } from '../types'

/**
 * 代码模板管理器
 * 管理固定的全局变量、方法模板，确保代码结构的一致性
 */
export class CodeTemplateManager {
  /**
   * 生成完整的页面代码
   */
  static generatePageCode(
    globalConfig: GlobalConfig,
    componentCode: string,
    pageName: string = 'GeneratedPage'
  ): string {
    const template = this.getCodeTemplate(globalConfig)

    return `${template.imports}

${template.globals}

const ${pageName}: React.FC = () => {
  // ========== 固定的全局状态管理 ==========
  ${this.generateGlobalStates(globalConfig)}
  
  // ========== 固定的事件处理方法 ==========
  ${this.generateGlobalMethods(globalConfig)}
  
  // ========== 页面渲染 ==========
  return (
    <div className="page-container">
      ${componentCode}
    </div>
  )
}

export default ${pageName}`
  }

  /**
   * 获取代码模板
   */
  private static getCodeTemplate(globalConfig: GlobalConfig): CodeTemplate {
    return {
      imports: this.generateImports(),
      globals: this.generateGlobals(globalConfig),
      pageTemplate: this.generatePageTemplate()
    }
  }

  /**
   * 生成导入语句
   */
  private static generateImports(): string {
    return `import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Form, message, Modal } from 'antd'
import { 
  PageListQuery, 
  FormItemInput, 
  FormItemSelect, 
  ModalForm,
  ProTable 
} from '@fundam/antd'
import { useAntFormInstance } from '@fundam/hooks'`
  }

  /**
   * 生成全局变量和配置
   */
  private static generateGlobals(globalConfig: GlobalConfig): string {
    return `// ========== 全局API配置 ==========
const API_CONFIG = ${JSON.stringify(globalConfig.apis, null, 2)}

// ========== 全局变量配置 ==========
const GLOBAL_VARIABLES = ${JSON.stringify(globalConfig.variables, null, 2)}

// ========== 路由参数 ========== 
const ROUTE_PARAMS = ${JSON.stringify(globalConfig.routeParams)}

// ========== 查询参数 ==========
const QUERY_PARAMS = ${JSON.stringify(globalConfig.queryParams)}`
  }

  /**
   * 生成页面模板
   */
  private static generatePageTemplate(): string {
    return `const GeneratedPage: React.FC = () => {
  return (
    <div className="page-container">
      {/* 页面内容将在这里生成 */}
    </div>
  )
}`
  }

  /**
   * 生成全局状态管理代码
   */
  private static generateGlobalStates(globalConfig: GlobalConfig): string {
    const states: string[] = []

    // 生成API相关状态
    Object.keys(globalConfig.apis).forEach(apiKey => {
      states.push(`const [${apiKey}Loading, set${this.capitalize(apiKey)}Loading] = useState(false)`)
    })

    // 生成变量状态
    Object.entries(globalConfig.variables).forEach(([key, config]) => {
      if (config.type === 'state') {
        const defaultValue = config.defaultValue !== undefined
          ? JSON.stringify(config.defaultValue)
          : 'undefined'
        states.push(`const [${key}, set${this.capitalize(key)}] = useState(${defaultValue})`)
      } else if (config.type === 'ref') {
        states.push(`const ${key}Ref = useRef(${config.defaultValue || 'null'})`)
      }
    })

    // 表单实例
    states.push('const form = useAntFormInstance()')

    // 通用弹窗状态
    states.push('const [modalVisible, setModalVisible] = useState(false)')
    states.push('const [currentRecord, setCurrentRecord] = useState(null)')

    return states.join('\n  ')
  }

  /**
   * 生成全局方法
   */
  private static generateGlobalMethods(globalConfig: GlobalConfig): string {
    const methods: string[] = []

    // 生成API调用方法
    Object.entries(globalConfig.apis).forEach(([apiKey, apiConfig]) => {
      methods.push(this.generateApiMethod(apiKey, apiConfig))
    })

    // 生成通用事件处理方法
    methods.push(this.generateCommonMethods())

    return methods.join('\n\n  ')
  }

  /**
   * 生成API调用方法
   */
  private static generateApiMethod(apiKey: string, apiConfig: any): string {
    const methodName = `handle${this.capitalize(apiKey)}`

    return `const ${methodName} = useCallback(async (params = {}) => {
    try {
      set${this.capitalize(apiKey)}Loading(true)
      const response = await fetch('${apiConfig.url}', {
        method: '${apiConfig.method}',
        headers: {
          'Content-Type': 'application/json',
          ...${JSON.stringify(apiConfig.headers || {})}
        },
        body: ${apiConfig.method !== 'GET' ? 'JSON.stringify(params)' : 'undefined'}
      })
      
      if (!response.ok) {
        throw new Error(\`API调用失败: \${response.statusText}\`)
      }
      
      const data = await response.json()
      message.success('操作成功')
      return data
    } catch (error) {
      console.error('${apiKey} API调用失败:', error)
      message.error(error.message || '操作失败')
      throw error
    } finally {
      set${this.capitalize(apiKey)}Loading(false)
    }
  }, [])`
  }

  /**
   * 生成通用方法
   */
  private static generateCommonMethods(): string {
    return `// 打开弹窗
  const openModal = useCallback((record = null) => {
    setCurrentRecord(record)
    setModalVisible(true)
  }, [])
  
  // 关闭弹窗
  const closeModal = useCallback(() => {
    setModalVisible(false)
    setCurrentRecord(null)
    form.resetFields()
  }, [form])
  
  // 确认删除
  const confirmDelete = useCallback((record) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后无法恢复，是否确认删除？',
      onOk: () => {
        // 这里会被AI或用户配置具体的删除逻辑
        message.success('删除成功')
      }
    })
  }, [])`
  }

  /**
   * 首字母大写
   */
  private static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  /**
   * 生成组件ID注释
   */
  static generateComponentIdComment(componentId: string, componentName: string): string {
    return `{/* ID: ${componentId}, Name: ${componentName} */}`
  }

  /**
   * 为组件代码添加ID注释
   */
  static wrapComponentWithId(componentCode: string, componentId: string, componentName: string): string {
    const comment = this.generateComponentIdComment(componentId, componentName)
    return `${comment}\n${componentCode}`
  }

  /**
   * 生成默认的全局配置
   */
  static getDefaultGlobalConfig(): GlobalConfig {
    return {
      apis: {
        userList: {
          url: '/api/user/list',
          method: 'GET',
          description: '获取用户列表'
        },
        userAdd: {
          url: '/api/user/add',
          method: 'POST',
          description: '新增用户'
        },
        userEdit: {
          url: '/api/user/edit',
          method: 'PUT',
          description: '编辑用户'
        },
        userDelete: {
          url: '/api/user/delete',
          method: 'DELETE',
          description: '删除用户'
        }
      },
      variables: {
        loading: {
          name: 'loading',
          type: 'state',
          defaultValue: false,
          description: '页面加载状态'
        },
        dataSource: {
          name: 'dataSource',
          type: 'state',
          defaultValue: [],
          description: '表格数据源'
        }
      },
      routeParams: ['id'],
      queryParams: ['tab', 'status']
    }
  }
}
