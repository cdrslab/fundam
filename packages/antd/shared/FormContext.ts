import React from 'react'

import { FormDirection, FormDisplayType, FormRowCol, FunFormInstance } from './types';

export interface FormContextProps {
  form: FunFormInstance // 表单实例对象
  direction: FormDirection // 排列方向
  rowCol: FormRowCol // 当direction为horizontal（横向布局表单）时，可以设置每行多少个FormItem
  showValidateMessagesRow: Boolean // 展示错误信息行占位（通常筛选表单不需要展示表单错误）
  displayType: FormDisplayType // Form展示效果，default：正常表单展示、text：文字展示、disabled：置灰展示
  displayTextEmpty: string, // 当displayType为text时，表单项为空，则根据此属性展示空值，默认：-（横线展示）
  collapseNames: Array<string> // 收起的表单项（name区分）
  formCollapse: Boolean, // 表单展开收起，默认收起
}

const FormContext = React.createContext<FormContextProps | undefined>(undefined)

export default FormContext
