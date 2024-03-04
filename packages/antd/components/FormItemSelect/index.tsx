import React from 'react'
import { Select } from 'antd'
import { SelectProps as AntSelectProps } from 'antd/es/select/index'

import { FormItemCommonProps, withFormItem } from '../withFormItem'

export interface FormItemSelectProps extends FormItemCommonProps, Omit<AntSelectProps, 'children' | 'name' | 'onReset' | 'status'> {

}

export const FormItemSelect: React.FC<FormItemSelectProps> = withFormItem(Select)
