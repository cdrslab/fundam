import React from 'react'
import { Checkbox } from 'antd'
import { CheckboxProps as AntCheckboxProps } from 'antd/es/checkbox/index'

import { FormItemOptionalProps, withFormItem } from '../withFormItem'
import { GetData } from '../../shared/types';

export interface FormItemCheckboxProps extends GetData, FormItemOptionalProps, Omit<AntCheckboxProps, 'children' | 'name' | 'onReset' | 'status'> {
}

export const FormItemCheckbox: React.FC<FormItemCheckboxProps> = withFormItem(Checkbox)
