import React, { ReactNode, useEffect } from 'react'
import { DatePicker, Input, Form, Col } from 'antd'
import { RangePickerProps as AntDatePickerRangePickerProps } from 'antd/es/date-picker/index'

import { FormItemCommonProps } from '../withFormItem'
import dayjs, { Dayjs } from 'dayjs';
import { getFormItemDefaultData } from '../../shared/utils';
import { useForm } from '../../hooks/useForm';
import { FormItem } from '../FormItem';
import { GetData } from '../../shared/types';

export interface FormItemDatePickerRangePickerProps extends Omit<FormItemCommonProps, 'name' | 'tooltip' | 'extra'>, Omit<AntDatePickerRangePickerProps, 'id' | 'children' | 'name' | 'onReset' | 'status'> {
  name?: string
  names?: Array<string> // 如：['startTime', ‘endTime’] 可以直接格式化两个字段
  format?: string
  tooltip?: string | GetData | ReactNode
  extra?: string | GetData | ReactNode
}

const { RangePicker } = DatePicker
const { Item: AntFormItem } = Form

export const FormItemDatePickerRangePicker: React.FC<FormItemDatePickerRangePickerProps> = ({
  // 新增props
  names,
  rowCol,
  displayType,
  displayTextEmpty,
  // ant component props
  format = 'YYYY-MM-DD HH:mm:ss',
  showTime = {
   defaultValue: [dayjs('00:00:00', 'HH:mm:ss'), dayjs('23:59:59', 'HH:mm:ss')]
  },
  allowClear,
  autoFocus,
  className,
  dateRender,
  cellRender,
  components,
  disabled,
  disabledDate,
  order,
  preserveInvalidOnBlur,
  popupClassName,
  getPopupContainer,
  inputReadOnly,
  locale,
  minDate,
  maxDate,
  mode,
  needConfirm,
  nextIcon,
  open,
  panelRender,
  picker,
  placeholder,
  placement,
  popupStyle,
  prevIcon,
  presets,
  size,
  status,
  style,
  suffixIcon,
  superNextIcon,
  superPrevIcon,
  variant,
  onOpenChange,
  onPanelChange,
  // RangePicker 专属props
  allowEmpty,
  defaultPickerValue,
  defaultValue,
  disabledTime,
  id,
  pickerValue,
  renderExtraFooter,
  separator,
  value,
  onCalendarChange,
  onChange,
  onFocus,
  onBlur,
  ...formItemProps
}) => {
  const { name, initialValue } = formItemProps
  const { currentRules } = getFormItemDefaultData(formItemProps)
  const {
    form,
    direction,
    collapseNames,
    formCollapse,
    rowCol: formRowCol,
    displayType: formDisplayType,
    displayTextEmpty: formDisplayTextEmpty
  } = useForm()

  const currentDisplayType = displayType || formDisplayType
  const currentDisplayTextEmpty = displayTextEmpty || formDisplayTextEmpty
  // 过滤form item value（因为antd5+默认选中的时间为dayjs对象），本组件使用字符串
  const useNames = names?.length === 2
  const ignoreFormItemName = names?.length ? '__' + names.join('_') : '__' + name

  const rangeComponentValue = Form.useWatch(ignoreFormItemName, form as any)

  // 同步更新，更改隐藏FormItem的值
  useEffect(() => {
    let [newStartValue, newEndValue] = rangeComponentValue || []
    newStartValue = !newStartValue ? newStartValue : newStartValue.format(format)
    newEndValue = !newEndValue ? newEndValue : newEndValue.format(format)
    if (useNames) {
      form.setFieldsValue({
        [names[0]]: newStartValue,
        [names[1]]: newEndValue
      })
    } else {
      form.setFieldsValue({
        [name as any]: [newStartValue, newEndValue]
      })
    }
  }, [rangeComponentValue]);

  // 展示类型为文字时，相关处理
  const getDisplayValue = () => {
    if (useNames) {
      const start = form.getFieldValue(names[0]) || currentDisplayTextEmpty
      const end = form.getFieldValue(names[1]) || currentDisplayTextEmpty
      return start + ' ~ ' + end
    } else {
      const [start, end] = form.getFieldValue(name)
      return start ? start + ' ~ ' + end : currentDisplayTextEmpty
    }
  }

  // 回显-设置组件展示内容
  const setRangePickerValue = (startValue: string | Dayjs, endValue: string | Dayjs) => {
    if (startValue && endValue) {
      startValue = typeof startValue === 'string' ? dayjs(startValue) : startValue
      endValue = typeof endValue === 'string' ? dayjs(endValue) : endValue
      form.setFieldsValue({
        [ignoreFormItemName]: [startValue, endValue]
      })
    }
  }

  // 回显
  const defaultShouldUpdate = (prevValue: Record<string, any>, curValue: Record<string, any>) => {
    if (useNames) {
      const startValue = curValue?.[names[0]]
      const endValue = curValue?.[names[1]]
      const lastStartValue = prevValue?.[names[0]]
      const lastEndValue = prevValue?.[names[1]]
      if (startValue === lastStartValue && endValue === lastEndValue) return false
      setRangePickerValue(startValue, endValue)
    } else {
      const [startValue, endValue] = curValue?.[name as any] || []
      const [lastStartValue, lastEndValue] = prevValue?.[name as any] || []
      if (startValue === lastStartValue && endValue === lastEndValue) return false
      setRangePickerValue(startValue, endValue)
    }
    return true
  }

  const rangePickerProps = {
    format,
    showTime,
    allowClear,
    autoFocus,
    className,
    dateRender,
    cellRender,
    components,
    disabled: currentDisplayType === 'disabled',
    disabledDate,
    order,
    preserveInvalidOnBlur,
    popupClassName,
    getPopupContainer,
    inputReadOnly,
    locale,
    minDate,
    maxDate,
    mode,
    needConfirm,
    nextIcon,
    open,
    panelRender,
    picker,
    placeholder,
    placement,
    popupStyle,
    prevIcon,
    presets,
    size,
    style: style || { width: '100%' },
    suffixIcon,
    superNextIcon,
    superPrevIcon,
    variant,
    onOpenChange,
    onPanelChange,
    // RangePicker 专属props
    allowEmpty,
    defaultPickerValue,
    defaultValue,
    disabledTime,
    id,
    pickerValue,
    renderExtraFooter,
    separator,
    value,
    onCalendarChange,
    onChange,
    onFocus,
    onBlur
  }

  const formItemClass = direction === 'vertical' ? 'fun-form-item-vertical' : ''
  const formItemInitialValue = initialValue?.length !== 2 ? initialValue : [dayjs(initialValue[0]), dayjs(initialValue[1])]

  const buildIgnoreFormItem = () => {
    if (useNames) {
      return names.map((n: any, index: number) => (
        <AntFormItem
          name={n}
          key={n}
          initialValue={initialValue?.[index]}
          hidden
          shouldUpdate={defaultShouldUpdate}
        >
          <Input/>
        </AntFormItem>
      ))
    }
    return (
      <AntFormItem
        hidden
        name={name}
        initialValue={initialValue}
        shouldUpdate={defaultShouldUpdate}
      >
        <Input/>
      </AntFormItem>
    )
  }

  if (currentDisplayType === 'text') {
    // 文字展示
    return (
      <FormItem
        {...formItemProps}
        className={formItemClass}
      >
        <div className="fun-form-item-display-text">{getDisplayValue()}</div>
      </FormItem>
    )
  }

  let formItem = (
    <FormItem
      {...formItemProps}
      className={formItemClass}
      initialValue={formItemInitialValue}
      // 为了保持校验，无name的Form.Item，不会对该字段进行校验，使用__开头定义隐藏字段，提交时，过滤__开头的字段
      name={ignoreFormItemName}
      rules={currentRules}
      hidden={formCollapse && collapseNames.includes(name || '') && direction === 'horizontal' || formItemProps.hidden}
    >
      <RangePicker
        {...rangePickerProps}
      />
    </FormItem>
  )

  if (direction === 'horizontal' && !(formCollapse && collapseNames.includes(formItemProps.name as any) || formItemProps.hidden)) {
    const colSpan = rowCol ? rowCol : (24 / formRowCol)
    formItem = <Col span={colSpan}>{formItem}</Col>
  }

  return (
    <>
      {buildIgnoreFormItem()}
      {formItem}
    </>
  )
}
