// @ts-ignore
import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { Col } from 'antd'
import { isDef } from '@fundam/utils'
import { useLocalStorage } from '@fundam/hooks'
import { FormItemProps as AntFormItemProps } from 'antd/es/form/FormItem'
import { get } from 'lodash'

import { useForm } from '../../hooks/useForm';
import { useFun } from '../../hooks/useFun'
import { formatDataToOptions, getDisplayText } from '../../shared/utils'
import { FormDisplayType, GetData } from '../../shared/types'
import { FormItem } from '../FormItem'

export interface FunFormItemProps {
  rowCol?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24
  displayType?: FormDisplayType
  displayTextEmpty?: string
  noLabel?: boolean // 不展示label（关联设置colon）
  visibleRule?: (() => boolean) | string
  observe?: Array<string>
}

export interface FormItemCommonProps extends Omit<AntFormItemProps, 'tooltip' | 'extra'>, FunFormItemProps {
  tooltip?: string | GetData | ReactNode
  extra?: string | GetData | ReactNode
  options?: Array<any>
}

// 可选择的组件，如：Select、Radio、Checkbox等
export interface FormItemOptionalProps extends FormItemCommonProps {
  labelKey?: string
  valueKey?: string
  childrenKey?: string
}

const getPlaceholder = (props: any, componentName: string): string => {
  let { placeholder } = props
  if (placeholder) return placeholder
  if (['Input', 'TextArea'].includes(componentName)) {
    placeholder = '请输入'
  }
  if (['Select', 'Cascader'].includes(componentName)) {
    placeholder = '请选择'
  }
  return placeholder
}

export function withFormItem(WrappedComponent: any) {
  return (props: any) => {
    const {
      // formItem新增props
      visibleRule, // 表达式 & Func 计算是否展示组件
      observe, // 监听 变化 => 触发 visibleRule 重新计算

      rowCol,
      displayType,
      displayTextEmpty,
      noLabel = false,
      isNumber,
      // 请求接口相关
      dataFunc,
      dataApi,
      dataApiReqData = {},
      dataApiMethod = 'get',
      cacheKey,
      cacheExpirationSec = 120, // 默认缓存120秒
      resDataPath,
      // 可选组件相关
      labelKey = 'label',
      valueKey = 'value',
      childrenKey = 'children',
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

    const componentName = WrappedComponent.displayName as string

    const [loading, setLoading] = useState(wrappedComponentProps.loading || false) // 加载中
    const [options, setOptions] = useState(wrappedComponentProps.options || []) // 下拉组件等的options
    const { request } = useFun()
    const [optionsCache, setOptionsCache] = useLocalStorage(cacheKey, null, cacheExpirationSec)

    const initRef = useRef(false) // 用于防止父级更新，导致子组件两次 init，发起两次请求

    const {
      form,
      direction,
      collapseNames,
      formCollapse,
      rowCol: formRowCol,
      displayType: formDisplayType,
      displayTextEmpty: formDisplayTextEmpty
    } = useForm()

    useEffect(() => {
      if (!initRef.current) {
        init()
        initRef.current = true
      }
    }, [])

    const init = async () => {
      if (!dataApi && !dataFunc) return
      try {
        setLoading(true)
        if (optionsCache) {
          setOptions(optionsCache)
          return
        }
        let res = dataApi ? await request[dataApiMethod](dataApi, dataApiReqData) : await dataFunc(dataApiReqData)
        res = resDataPath ? get(res, resDataPath) : res
        res = formatDataToOptions(res, labelKey, valueKey, childrenKey)
        cacheKey && setOptionsCache(res)
        setOptions(res)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    const currentRules = required ? (rules || [{ required: true, message: `${label || '该字段'}为必填字段` }]) : []

    // displayType为text时，优先展示当前FormItem设置的属性
    const currentDisplayType = displayType || formDisplayType
    const currentDisplayTextEmpty = displayTextEmpty || formDisplayTextEmpty

    const getDisplayValue = () => {
      const formItemValue = form.getFieldValue(name)
      if (!isDef(formItemValue)) return currentDisplayTextEmpty
      if (['Select', 'Cascader', 'Radio', 'Checkbox'].includes(componentName) && options?.length) {
        return getDisplayText(options, formItemValue, '，') || currentDisplayTextEmpty
      }
      return formItemValue
    }

    const defaultNormalize = (value: any, prevValue: any) => {
      if (!isNumber || componentName !== 'Input') return value
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
      if (isNumber && componentName === 'Input') {
        const currentFormItemValue = curValue[name]
        if (typeof currentFormItemValue === 'string') {
          curValue[name] = parseInt(currentFormItemValue)
        }
      }
      if (['Select', 'Cascader', 'Checkbox']) {
        // 多选数组，自动处理逗号分隔的值
        if (curValue[name] && typeof curValue[name] === 'string') {
          curValue[name] = curValue[name].includes(',') ? curValue[name].split(',') : curValue[name]
        }
      }
      return true
    }

    const buildComponent = () => {
      if (['Select', 'Cascader'].includes(componentName)) {
        return (
          <WrappedComponent
            {...wrappedComponentProps as any}
            options={options}
            loading={loading}
            placeholder={getPlaceholder(props, componentName)}
            disabled={wrappedComponentProps.disabled || currentDisplayType === 'disabled'}
          />
        )
      } else if (['Radio', 'Checkbox'].includes(componentName)) {
        return (
          <WrappedComponent.Group
            {...wrappedComponentProps as any}
            disabled={wrappedComponentProps.disabled || currentDisplayType === 'disabled'}
          >
            {
              options.map((item: any) => (
                <WrappedComponent value={item.value} key={item.value}>{item.label}</WrappedComponent>
              ))
            }
          </WrappedComponent.Group>
        )
      }
      return (
        <WrappedComponent
          {...wrappedComponentProps as any}
          placeholder={getPlaceholder(props, componentName)}
          disabled={wrappedComponentProps.disabled || currentDisplayType === 'disabled'}
        />
      )
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
          <FormItem
            {...commonAntFormItemProps}
            visibleRule={visibleRule}
            observe={observe}
            rules={currentRules}
            hidden={formCollapse && collapseNames.includes(name) && direction === 'horizontal' || hidden}
            normalize={normalize || defaultNormalize}
            shouldUpdate={shouldUpdate || defaultShouldUpdate}
            label={noLabel ? ' ' : label}
            colon={!noLabel}
          >
            {buildComponent()}
          </FormItem>
        )
      }
      // 文字展示
      return (
        <FormItem
          {...commonAntFormItemProps}
          label={noLabel ? ' ' : label}
          colon={!noLabel}
          visibleRule={visibleRule}
          observe={observe}
        >
          <div className="fun-form-item-display-text">{getDisplayValue()}</div>
        </FormItem>
      )
    }

    const formItem = buildFormItem()

    if (direction === 'horizontal' && !(formCollapse && collapseNames.includes(name) || hidden)) {
      const colSpan = rowCol ? rowCol : (24 / formRowCol)
      return <Col span={colSpan}>{formItem}</Col>
    }
    return formItem
  }
}
