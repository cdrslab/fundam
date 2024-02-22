import React from 'react'
import { FormInstance } from 'antd/es/form'

export interface FormContextProps {
  form: FormInstance // 表单实例对象
  direction: 'horizontal' | 'vertical' // 排列方向
}

const FormContext = React.createContext<FormContextProps | undefined>(undefined)

export default FormContext
