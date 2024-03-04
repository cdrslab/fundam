import React from 'react'
import { Input } from 'antd'
import { InputProps as AntInputProps } from 'antd/es/input/Input'

import { FormItemCommonProps, withFormItem } from '../withFormItem'

export interface FormItemInputProps extends FormItemCommonProps, Omit<AntInputProps, 'children' | 'name' | 'onReset' | 'status'> {
  isNumber?: Boolean
}

export const FormItemInput: React.FC<FormItemInputProps> = withFormItem(Input)
