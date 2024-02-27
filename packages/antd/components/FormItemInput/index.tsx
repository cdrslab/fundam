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
}

const AntFormItem = AntForm.Item
export const FormItemInput: React.FC<FormItemInputProps> = ({
  rowCol,
  displayType,
  displayTextEmpty,
  // Antd Input Props: https://ant.design/components/input-cn#input
  // 移除与FormItem冲突的 defaultValue、value、status 属性
  placeholder,
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
    rowCol: formRowCol,
    displayType: formDisplayType,
    displayTextEmpty: formDisplayTextEmpty
  } = useForm()

  const currentRules = required ? (rules || [{ required: true, message: `请输入${antFormItemProps.label}` }]) : []
  // 优先展示当前FormItem设置的属性
  const currentDisplayType = displayType || formDisplayType
  const currentDisplayTextEmpty = displayTextEmpty || displayTextEmpty

  const getCurrentDisplayValue = () => {
    const formItemValue = form.getFieldValue(antFormItemProps.name)
    return isDef(formItemValue) ? formItemValue : currentDisplayTextEmpty
  }

  const buildFormItem = () => {
    if (currentDisplayType === 'default' || currentDisplayType === 'disabled') {
      return (
        <AntFormItem className={direction === 'vertical' ? 'fun-form-item-vertical' : ''} rules={currentRules} {...antFormItemProps}>
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
            maxLength={maxLength}
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
      <AntFormItem className={direction === 'vertical' ? 'fun-form-item-vertical' : ''} rules={currentRules} {...antFormItemProps}>
        <div className="fun-form-item-display-text">{getCurrentDisplayValue()}</div>
      </AntFormItem>
    )
  }

  const formItem = buildFormItem()

  if (direction === 'horizontal') {
    const currentRowCol = rowCol || formRowCol
    validateRowCol(currentRowCol)
    const colSpan = 24 / currentRowCol
    return <Col span={colSpan}>{formItem}</Col>
  }
  return formItem
}

FormItemInput.defaultProps = {
  placeholder: '请输入'
}
