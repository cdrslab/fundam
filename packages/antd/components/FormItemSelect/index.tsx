import React from 'react'
import { Select } from 'antd'
import { SelectProps as AntSelectProps } from 'antd/es/select/index'

import { FormItemOptionalProps, withFormItem } from '../withFormItem'
import { GetData } from '../../shared/types';

export interface FormItemSelectProps extends GetData, FormItemOptionalProps, Omit<AntSelectProps, 'children' | 'name' | 'onReset' | 'status'> {
}

export const FormItemSelect: React.FC<FormItemSelectProps> = withFormItem(Select)
