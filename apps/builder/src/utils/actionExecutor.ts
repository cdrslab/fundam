import { message } from 'antd'
import { ButtonAction } from '../types/actions'
import { globalConfigManager } from '../store/globalConfig'
import { FormDataCollector } from './formDataCollector'

// 动作执行器
export class ActionExecutor {
  // 执行按钮动作列表
  static async executeActions(actions: ButtonAction[], context?: { buttonElement?: HTMLElement }): Promise<void> {
    for (const action of actions) {
      try {
        await this.executeAction(action, context)
      } catch (error) {
        console.error(`执行动作 ${action.type} 失败:`, error)
        message.error(`执行动作失败: ${error}`)
      }
    }
  }
  
  // 执行单个动作
  static async executeAction(action: ButtonAction, context?: { buttonElement?: HTMLElement }): Promise<void> {
    console.log(`执行动作: ${action.type}`, action.config)
    
    switch (action.type) {
      case 'modal':
        this.executeModalAction(action)
        break
        
      case 'api':
        await this.executeApiAction(action)
        break
        
      case 'form_submit':
        await this.executeFormSubmitAction(action, context)
        break
        
      case 'table_refresh':
        this.executeTableRefreshAction(action, context)
        break
        
      case 'navigation':
        this.executeNavigationAction(action)
        break
        
      case 'custom':
        this.executeCustomAction(action)
        break
        
      default:
        console.warn(`未知的动作类型: ${action.type}`)
    }
  }
  
  // 执行弹窗动作
  private static executeModalAction(action: ButtonAction): void {
    const { modalId, data } = action.config
    const modalConfig = globalConfigManager.getModalById(modalId)
    
    if (!modalConfig) {
      throw new Error(`未找到弹窗配置: ${modalId}`)
    }
    
    // 这里应该调用实际的弹窗组件
    // 由于是搭建器预览环境，我们只显示提示
    message.info(`打开弹窗: ${modalConfig.name}`)
    
    if (data) {
      console.log('传递给弹窗的数据:', data)
    }
  }
  
  // 执行API动作
  private static async executeApiAction(action: ButtonAction): Promise<void> {
    const { apiId, params, successMessage, errorMessage } = action.config
    const apiConfig = globalConfigManager.getApiById(apiId)
    
    if (!apiConfig) {
      throw new Error(`未找到API配置: ${apiId}`)
    }
    
    try {
      // 模拟API请求
      console.log(`调用API: ${apiConfig.name} (${apiConfig.method} ${apiConfig.url})`)
      console.log('请求参数:', params)
      
      // 模拟请求延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 模拟成功响应
      if (successMessage) {
        message.success(successMessage)
      } else {
        message.success('请求成功')
      }
      
      // 执行成功后的动作
      if (action.config.onSuccess) {
        await this.executeActions(action.config.onSuccess)
      }
      
    } catch (error) {
      if (errorMessage) {
        message.error(errorMessage)
      } else {
        message.error('请求失败')
      }
      
      // 执行失败后的动作
      if (action.config.onError) {
        await this.executeActions(action.config.onError)
      }
      
      throw error
    }
  }
  
  // 执行表单提交动作
  private static async executeFormSubmitAction(action: ButtonAction, context?: { buttonElement?: HTMLElement }): Promise<void> {
    const { formId, validateFirst, apiId } = action.config
    
    // 收集表单数据
    const formData = FormDataCollector.collectFormData(formId)
    console.log('收集到的表单数据:', formData)
    
    // 如果需要验证表单
    if (validateFirst) {
      // 这里应该调用实际的表单验证逻辑
      // 模拟验证过程
      const hasErrors = Object.keys(formData).length === 0
      if (hasErrors) {
        message.error('表单验证失败，请检查必填项')
        return
      }
    }
    
    // 如果配置了API，提交到API
    if (apiId) {
      const submitAction: ButtonAction = {
        id: 'temp_submit',
        type: 'api',
        name: '提交表单',
        config: {
          apiId,
          params: formData,
          successMessage: '提交成功',
          errorMessage: '提交失败'
        }
      }
      await this.executeApiAction(submitAction)
    } else {
      message.success('表单提交成功')
    }
  }
  
  // 执行表格刷新动作
  private static executeTableRefreshAction(action: ButtonAction, context?: { buttonElement?: HTMLElement }): void {
    const { tableId, collectFormData, formId } = action.config
    
    let queryParams: Record<string, any> = {}
    
    // 收集表单数据作为查询参数
    if (collectFormData) {
      queryParams = FormDataCollector.collectFormData(formId)
      console.log('收集到的查询参数:', queryParams)
    }
    
    // 查找目标表格
    const tableElement = tableId 
      ? document.getElementById(tableId)
      : FormDataCollector.findNearestTable(context?.buttonElement)
    
    if (!tableElement) {
      throw new Error('未找到目标表格')
    }
    
    // 刷新表格
    FormDataCollector.refreshTable(tableElement, queryParams)
    message.success('表格刷新成功')
  }
  
  // 执行导航动作
  private static executeNavigationAction(action: ButtonAction): void {
    const { type, path, params } = action.config
    
    console.log(`页面跳转: ${type} to ${path}`, params)
    
    switch (type) {
      case 'push':
        // window.history.pushState(params, '', path)
        message.info(`跳转到: ${path}`)
        break
        
      case 'replace':
        // window.history.replaceState(params, '', path)
        message.info(`替换当前页面为: ${path}`)
        break
        
      case 'back':
        // window.history.back()
        message.info('返回上一页')
        break
    }
  }
  
  // 执行自定义动作
  private static executeCustomAction(action: ButtonAction): void {
    const { code } = action.config
    
    try {
      // 创建安全的执行环境
      const func = new Function('message', 'console', 'FormDataCollector', code)
      func(message, console, FormDataCollector)
    } catch (error) {
      throw new Error(`自定义代码执行失败: ${error}`)
    }
  }
}