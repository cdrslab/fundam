import React from 'react'
import { Input as AntInput, Select as AntSelect, Form as AntForm, Col } from 'antd'
import { isDef } from '@fundam/utils'
import { FormItemProps as AntFormItemProps } from 'antd/es/form/FormItem'

import useForm from '../../hooks/useForm';
import { validateRowCol } from '../../shared/utils';
import { FormDisplayType, FormRowCol } from '../../shared/types';

export interface FunFormItemProps {
  rowCol?: FormRowCol
  displayType?: FormDisplayType
  displayTextEmpty?: string
}

export interface FormItemCommonProps extends AntFormItemProps, FunFormItemProps {}

const getPlaceholder = (props: any, component: any): string => {
  let { placeholder } = props
  if (placeholder) return placeholder
  if (component === AntInput) {
    placeholder = '请输入'
  } else if (component === AntSelect) {
    placeholder = '请选择'
  }
  return placeholder
}

const AntFormItem = AntForm.Item
export function withFormItem(WrappedComponent: React.FC<any>) {
  return (props: any) => {
    const {
      rowCol,
      displayType,
      displayTextEmpty,
      isNumber ,
      // Form.Item props: https://ant.design/components/form-cn#formitem
      colon,
      dependencies,
      extra,
      getValueFromEvent,
      getValueProps,
      hasFeedback,
      help,
      hidden,
      htmlFor,
      initialValue,
      label,
      labelAlign,
      labelCol,
      messageVariables,
      name,
      normalize,
      noStyle,
      preserve,
      required,
      rules,
      shouldUpdate,
      tooltip,
      trigger,
      validateFirst,
      validateDebounce,
      validateStatus,
      validateTrigger,
      valuePropName,
      wrapperCol,
      // Form.Item子组件：Input、Select等的props
      ...wrappedComponentProps
    } = props

    const {
      form,
      direction,
      collapseNames,
      formCollapse,
      rowCol: formRowCol,
      displayType: formDisplayType,
      displayTextEmpty: formDisplayTextEmpty
    } = useForm()

    const currentRules = required ? (rules || [{ required: true, message: `${label}为必填字段` }]) : []

    // displayType为text时，优先展示当前FormItem设置的属性
    const currentDisplayType = displayType || formDisplayType
    const currentDisplayTextEmpty = displayTextEmpty || formDisplayTextEmpty

    const getCurrentDisplayValue = () => {
      const formItemValue = form.getFieldValue(name)
      if (!isDef(formItemValue)) return currentDisplayTextEmpty
      if (WrappedComponent === AntSelect) {
        return wrappedComponentProps?.options?.find((item: any) => item?.value === formItemValue)?.label || currentDisplayTextEmpty
      }
      return formItemValue
    }

    const defaultNormalize = (value: any, prevValue: any, prevValues: any) => {
      if (!isNumber || WrappedComponent !== AntInput) return value
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
      if (prevValue[name] === curValue[name]) return false
      if (isNumber && WrappedComponent === AntInput) {
        const currentFormItemValue = curValue[name]
        if (typeof currentFormItemValue === 'string') {
          curValue[name] = parseInt(currentFormItemValue)
        }
      }
      return true
    }

    const buildFormItem = () => {
      const commonAntFormItemProps = {
        required,
        colon,
        dependencies,
        extra,
        getValueFromEvent,
        getValueProps,
        hasFeedback,
        help,
        htmlFor,
        initialValue,
        label,
        labelAlign,
        labelCol,
        messageVariables,
        name,
        noStyle,
        preserve,
        tooltip,
        trigger,
        validateFirst,
        validateDebounce,
        validateStatus,
        validateTrigger,
        valuePropName,
        wrapperCol,
        className: direction === 'vertical' ? 'fun-form-item-vertical' : '',
      }
      if (currentDisplayType === 'default' || currentDisplayType === 'disabled') {
        return (
          <AntFormItem
            {...commonAntFormItemProps}
            rules={currentRules}
            hidden={formCollapse && collapseNames.includes(name) && direction === 'horizontal' || hidden}
            normalize={normalize || defaultNormalize}
            shouldUpdate={shouldUpdate || defaultShouldUpdate}
          >
            <WrappedComponent
              {...wrappedComponentProps as any}
              placeholder={getPlaceholder(props, WrappedComponent)}
              disabled={wrappedComponentProps.disabled || currentDisplayType === 'disabled'}
            />
          </AntFormItem>
        )
      }
      // 文字展示
      return (
        <AntFormItem
          {...commonAntFormItemProps}
        >
          <div className="fun-form-item-display-text">{getCurrentDisplayValue()}</div>
        </AntFormItem>
      )
    }

    const formItem = buildFormItem()

    if (direction === 'horizontal' && !(formCollapse && collapseNames.includes(name) || hidden)) {
      const currentRowCol = rowCol || formRowCol
      validateRowCol(currentRowCol)
      const colSpan = 24 / currentRowCol
      return <Col span={colSpan}>{formItem}</Col>
    }
    return formItem
  }
}
