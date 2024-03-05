import { FormInstance } from 'antd/es/form';

export type FormDirection = 'horizontal' | 'vertical'
export type FormRowCol = 1 | 2 | 3 | 4 | 6 | 8 | 12 | 24
export type FormDisplayType = 'default' | 'text' | 'disabled'
export type FunFormInstance = Omit<FormInstance, 'setFieldValue'>

// 获取数据
export type GetData = {
  dataFunc?: Function // 获取数据的方法（优先级高于dataApi）
  dataApi?: string // 获取数据的接口
  dataApiReqData?: any // 请求数据
  dataApiMethod?: 'get' | 'post' | 'delete' | 'put'
  resDataPath?: string // 组件所需响应数据提取
}

// 可以包含options的组件
// export type IncludesOptionsAntComponent = Select
