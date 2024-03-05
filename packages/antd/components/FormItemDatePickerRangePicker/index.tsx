import React from 'react'
import { DatePicker } from 'antd'
import { RangePickerProps as AntDatePickerRangePickerProps } from 'antd/es/date-picker/index'

import { FormItemCommonProps, withFormItem } from '../withFormItem'

export interface FormItemDatePickerRangePickerProps extends Omit<FormItemCommonProps, 'name'>, Omit<AntDatePickerRangePickerProps, 'id' | 'children' | 'name' | 'onReset' | 'status'> {
  name?: string
  names?: Array<string> // 如：['startTime', ‘endTime’] 可以直接格式化两个字段
  format?: string
}

export const FormItemDatePicker: React.FC<FormItemDatePickerRangePickerProps> = withFormItem(DatePicker.RangePicker)
