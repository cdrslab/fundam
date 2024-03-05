import React from 'react'
import { Cascader } from 'antd'
import { CascaderProps as AntCascaderProps } from 'antd/es/cascader/index'

import { FormItemOptionalProps, withFormItem } from '../withFormItem'
import { GetData } from '../../shared/types';

export interface FormItemCascaderProps extends GetData, FormItemOptionalProps, Omit<AntCascaderProps, 'children' | 'name' | 'onReset' | 'status'> {
}

export const FormItemCascade: React.FC<FormItemCascaderProps> = withFormItem(Cascader)
