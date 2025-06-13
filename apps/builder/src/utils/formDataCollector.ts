// 表单数据收集器
export class FormDataCollector {
  // 收集指定表单的数据
  static collectFormData(formId?: string): Record<string, any> {
    let targetForm: HTMLFormElement | null = null
    
    if (formId) {
      // 查找指定ID的表单
      targetForm = document.getElementById(formId) as HTMLFormElement
    } else {
      // 自动查找最近的表单
      const forms = document.querySelectorAll('form')
      targetForm = forms[forms.length - 1] as HTMLFormElement // 取最后一个表单
    }
    
    if (!targetForm) {
      console.warn('未找到目标表单')
      return {}
    }
    
    const formData = new FormData(targetForm)
    const data: Record<string, any> = {}
    
    // 处理普通表单字段
    for (const [key, value] of formData.entries()) {
      if (data[key]) {
        // 处理多值字段（如多选框）
        if (Array.isArray(data[key])) {
          data[key].push(value)
        } else {
          data[key] = [data[key], value]
        }
      } else {
        data[key] = value
      }
    }
    
    // 处理特殊的Antd组件（通过data属性或自定义收集逻辑）
    this.collectAntdFormData(targetForm, data)
    
    return data
  }
  
  // 收集Antd表单组件数据
  private static collectAntdFormData(form: HTMLFormElement, data: Record<string, any>): void {
    // 查找所有带有data-field-name属性的元素（Antd表单项）
    const antdFields = form.querySelectorAll('[data-field-name]')
    
    antdFields.forEach(field => {
      const fieldName = field.getAttribute('data-field-name')
      if (!fieldName) return
      
      // 根据不同的组件类型收集数据
      const componentType = field.getAttribute('data-component-type')
      
      switch (componentType) {
        case 'Select':
          this.collectSelectValue(field as HTMLElement, fieldName, data)
          break
        case 'DatePicker':
          this.collectDatePickerValue(field as HTMLElement, fieldName, data)
          break
        case 'Checkbox':
          this.collectCheckboxValue(field as HTMLElement, fieldName, data)
          break
        case 'Radio':
          this.collectRadioValue(field as HTMLElement, fieldName, data)
          break
        default:
          // 默认收集input值
          const input = field.querySelector('input, textarea')
          if (input) {
            data[fieldName] = (input as HTMLInputElement).value
          }
      }
    })
  }
  
  private static collectSelectValue(element: HTMLElement, fieldName: string, data: Record<string, any>): void {
    const hiddenInput = element.querySelector('input[type="hidden"]')
    if (hiddenInput) {
      data[fieldName] = (hiddenInput as HTMLInputElement).value
    }
  }
  
  private static collectDatePickerValue(element: HTMLElement, fieldName: string, data: Record<string, any>): void {
    const input = element.querySelector('input')
    if (input) {
      data[fieldName] = input.value
    }
  }
  
  private static collectCheckboxValue(element: HTMLElement, fieldName: string, data: Record<string, any>): void {
    const checkboxes = element.querySelectorAll('input[type="checkbox"]:checked')
    const values = Array.from(checkboxes).map(cb => (cb as HTMLInputElement).value)
    data[fieldName] = values.length === 1 ? values[0] : values
  }
  
  private static collectRadioValue(element: HTMLElement, fieldName: string, data: Record<string, any>): void {
    const checkedRadio = element.querySelector('input[type="radio"]:checked')
    if (checkedRadio) {
      data[fieldName] = (checkedRadio as HTMLInputElement).value
    }
  }
  
  // 查找最近的表格组件
  static findNearestTable(startElement?: HTMLElement): HTMLElement | null {
    const tables = document.querySelectorAll('[data-component-type="Table"]')
    
    if (startElement) {
      // 查找最近的表格
      let current = startElement.parentElement
      while (current) {
        if (current.getAttribute('data-component-type') === 'Table') {
          return current
        }
        current = current.parentElement
      }
    }
    
    // 返回最后一个表格
    return tables.length > 0 ? tables[tables.length - 1] as HTMLElement : null
  }
  
  // 触发表格刷新
  static refreshTable(tableElement: HTMLElement, queryParams?: Record<string, any>): void {
    // 触发自定义刷新事件
    const refreshEvent = new CustomEvent('table-refresh', {
      detail: { queryParams }
    })
    tableElement.dispatchEvent(refreshEvent)
  }
  
  // 查找最近的表单
  static findNearestForm(startElement?: HTMLElement): HTMLFormElement | null {
    if (startElement) {
      let current = startElement.parentElement
      while (current) {
        if (current.tagName === 'FORM') {
          return current as HTMLFormElement
        }
        current = current.parentElement
      }
    }
    
    // 返回页面中最后一个表单
    const forms = document.querySelectorAll('form')
    return forms.length > 0 ? forms[forms.length - 1] as HTMLFormElement : null
  }
}