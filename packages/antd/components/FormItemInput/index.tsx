import React from 'react'
import { Input } from 'antd'

import { FormItemCommonProps, withFormItem } from '../withFormItem'

export const FormItemInput: React.FC<FormItemCommonProps> = withFormItem(Input)
