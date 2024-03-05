import React from 'react'
import { Radio } from 'antd'
import { RadioProps as AntRadioProps } from 'antd/es/radio/index'

import { FormItemOptionalProps, withFormItem } from '../withFormItem'
import { GetData } from '../../shared/types';

export interface FormItemRadioProps extends GetData, FormItemOptionalProps, Omit<AntRadioProps, 'children' | 'name' | 'onReset' | 'status'> {
}

export const FormItemRadio: React.FC<FormItemRadioProps> = withFormItem(Radio)
