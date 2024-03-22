import React from 'react'
import { Cascader } from 'antd'
import { CascaderProps as AntCascaderProps } from 'antd/es/cascader/index'

import { FormItemOptionalProps, withFormItem } from '../withFormItem'
import { GetData } from '../../shared/types';
import { withFormItemArrayNames } from '../withFormItemArrayNames';

export interface FormItemCascaderProps extends GetData, FormItemOptionalProps, Omit<AntCascaderProps, 'children' | 'name' | 'onReset' | 'status'> {
  names?: Array<string>
}

export const FormItemCascade: React.FC<FormItemCascaderProps> = withFormItemArrayNames(withFormItem(Cascader))
