import React from 'react'
import { FormInstance } from 'antd/es/form'

export interface FormContextProps {
  form: FormInstance // 表单实例对象
  direction: 'horizontal' | 'vertical' // 排列方向
  rowCol: 1 | 2 | 3 | 4 | 6 | 8 | 12 | 24 // 当direction为horizontal（横向布局表单）时，可以设置每行多少个FormItem
}

const FormContext = React.createContext<FormContextProps | undefined>(undefined)

export default FormContext
