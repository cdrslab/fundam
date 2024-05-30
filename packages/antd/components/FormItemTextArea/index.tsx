import React from 'react'
import { Input } from 'antd'
import { TextAreaProps as AntTextAreaProps } from 'antd/es/input/TextArea'

import { FormItemCommonProps, withFormItem } from '../withFormItem'

export interface FormItemTextAreaProps extends FormItemCommonProps, Omit<AntTextAreaProps, 'children' | 'name' | 'onReset' | 'status'> {
}

const { TextArea } = Input
export const FormItemTextArea: React.FC<FormItemTextAreaProps> = withFormItem(TextArea)
