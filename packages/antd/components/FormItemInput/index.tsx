import React from 'react'
import { Input as AntInput, Form as AntForm, Col } from 'antd'
import { InputProps as AntInputProps } from 'antd/es/input/Input'
import { FormItemProps as AntFormItemProps } from 'antd/es/form/FormItem'

import useForm from '../../hooks/useForm';
import { validateRowCol } from '../../shared/utils';
import { FormRowCol } from '../../shared/types';

interface FormItemInputProps extends AntFormItemProps, Omit<AntInputProps, 'children' | 'name' | 'onReset' | 'status'> {
  rowCol?: FormRowCol
}

const AntFormItem = AntForm.Item
export const FormItemInput: React.FC<FormItemInputProps> = ({
  rowCol,
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
  ...antFormItemProps
}) => {
  const { rowCol: formRowCol, direction } = useForm()

  let currentRules
  if (antFormItemProps.required) {
    currentRules = antFormItemProps.rules || [{ required: true, message: '请输入' + antFormItemProps.label }]
  }

  const formItem = (
    <AntFormItem className={direction === 'vertical' ? 'fun-form-item-vertical' : ''} rules={currentRules} {...antFormItemProps}>
      <AntInput
        onPressEnter={onPressEnter}
        placeholder={placeholder}
        addonBefore={addonBefore}
        addonAfter={addonAfter}
        allowClear={allowClear}
        classNames={classNames}
        count={count}
        disabled={disabled}
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
