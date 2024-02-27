import React from 'react'
import { FormInstance } from 'antd/es/form'

import { FormDirection, FormRowCol } from './types';

export interface FormContextProps {
  form: FormInstance // 表单实例对象
  direction: FormDirection // 排列方向
  rowCol: FormRowCol // 当direction为horizontal（横向布局表单）时，可以设置每行多少个FormItem
  showValidateMessagesRow: Boolean // 展示错误信息行占位（通常筛选表单不需要展示表单错误）
}

const FormContext = React.createContext<FormContextProps | undefined>(undefined)

export default FormContext
