import React from 'react'
import { Input as AntInput, Form as AntForm, Col } from 'antd'
import { isDef } from '@fundam/utils'
import { InputProps as AntInputProps } from 'antd/es/input/Input'
import { FormItemProps as AntFormItemProps } from 'antd/es/form/FormItem'

import useForm from '../../hooks/useForm';
import { validateRowCol } from '../../shared/utils';
import { FormDisplayType, FormRowCol } from '../../shared/types';

interface FormItemInputProps extends AntFormItemProps, Omit<AntInputProps, 'children' | 'name' | 'onReset' | 'status'> {
  rowCol?: FormRowCol
  displayType?: FormDisplayType
  displayTextEmpty?: string
  isNumber?: Boolean
}

const AntFormItem = AntForm.Item
export const FormItemInput: React.FC<FormItemInputProps> = ({
  rowCol,
  displayType,
  displayTextEmpty,
  isNumber = false, // 输入的内容自动转换为数字
  // Antd Input Props: https://ant.design/components/input-cn#input
  // 移除与FormItem冲突的 defaultValue、value、status 属性
  placeholder = '请输入',
  addonBefore,
  addonAfter,
  allowClear,
  classNames,
  count,
  disabled,
  id,
  maxLength,
  prefix,
  showCount,
  styles,
  size,
  suffix,
  type,
  variant,
  onChange,
  onPressEnter, // 原生就会触发form submit
  // 部分需要处理的FormItemProps
  required,
  rules,
  ...antFormItemProps
}) => {

  const {
    form,
    direction,
    collapseNames,
    formCollapse,
    rowCol: formRowCol,
    displayType: formDisplayType,
    displayTextEmpty: formDisplayTextEmpty
  } = useForm()

  const currentRules = required ? (rules || [{ required: true, message: `请输入${antFormItemProps.label}` }]) : []
  // 优先展示当前FormItem设置的属性
  const currentDisplayType = displayType || formDisplayType
  const currentDisplayTextEmpty = displayTextEmpty || formDisplayTextEmpty

  const getCurrentDisplayValue = () => {
    const formItemValue = form.getFieldValue(antFormItemProps.name)
    return isDef(formItemValue) ? formItemValue : currentDisplayTextEmpty
  }

  // Input兼容输入数字
  // const handleGetValueFromEvent = (event: any) => {
  //   const { value } = event.target
  //   return /^[1-9][0-9]*$/.test(value) ? parseInt(value) : null
  // }
  // if (isNumber) {
  //   if (antFormItemProps.getValueFromEvent) {
  //     const propGetValueFromEvent = antFormItemProps.getValueFromEvent
  //     antFormItemProps.getValueFromEvent = (event) => {
  //       event.target.value = handleGetValueFromEvent(event)
  //       return propGetValueFromEvent(event)
  //     }
  //   } else {
  //     antFormItemProps.getValueFromEvent = handleGetValueFromEvent
  //   }
  // }

  const defaultNormalize = (value: any, prevValue: any, prevValues: any) => {
    if (!isNumber) return value
    if (value === '') return null
    // 兼容Input输入数字
    if (/^[1-9][0-9]*$/.test(value)) {
      return parseInt(value)
    } else {
      return prevValue
    }
  }

  // 仅form.setFieldsValue会触发，setFieldValue不会触发
  const defaultShouldUpdate = (prevValue: any, curValue: any) => {
    if (prevValue[antFormItemProps.name] === curValue[antFormItemProps.name]) return false
    if (isNumber) {
      const currentFormItemValue = curValue[antFormItemProps.name]
      if (typeof currentFormItemValue === 'string') {
        curValue[antFormItemProps.name] = parseInt(currentFormItemValue)
      }
    }
    return true
  }

  const buildFormItem = () => {
    if (currentDisplayType === 'default' || currentDisplayType === 'disabled') {
      return (
        <AntFormItem
          className={direction === 'vertical' ? 'fun-form-item-vertical' : ''}
          required={required}
          rules={currentRules}
          hidden={formCollapse && collapseNames.includes(antFormItemProps.name) && direction === 'horizontal' || antFormItemProps.hidden}
          normalize={defaultNormalize}
          shouldUpdate={defaultShouldUpdate}
          {...antFormItemProps}
        >
          <AntInput
            onPressEnter={onPressEnter}
            placeholder={placeholder}
            addonBefore={addonBefore}
            addonAfter={addonAfter}
            allowClear={allowClear}
            classNames={classNames}
            count={count}
            disabled={disabled || currentDisplayType === 'disabled'}
            id={id}
            maxLength={isNumber ? 16 : maxLength}
            prefix={prefix}
            showCount={showCount}
            styles={styles}
            size={size}
            suffix={suffix}
            type={type}
            variant={variant}
            onChange={onChange}
          />
        </AntFormItem>
      )
    }
    // 文字展示
    return (
      <AntFormItem
        className={direction === 'vertical' ? 'fun-form-item-vertical' : ''}
        required={required}
        {...antFormItemProps}
      >
        <div className="fun-form-item-display-text">{getCurrentDisplayValue()}</div>
      </AntFormItem>
    )
  }

  const formItem = buildFormItem()

  if (direction === 'horizontal' && !(formCollapse && collapseNames.includes(antFormItemProps.name) || antFormItemProps.hidden)) {
    const currentRowCol = rowCol || formRowCol
    validateRowCol(currentRowCol)
    const colSpan = 24 / currentRowCol
    return <Col span={colSpan}>{formItem}</Col>
  }
  return formItem
}
