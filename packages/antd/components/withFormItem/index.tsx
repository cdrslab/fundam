import React, { useEffect, useMemo, useState } from 'react'
import { Input as AntInput, Select as AntSelect, Form as AntForm, Col, Input } from 'antd'
import { isDef } from '@fundam/utils'
import { FormItemProps as AntFormItemProps } from 'antd/es/form/FormItem'
import { get } from 'lodash'
import dayjs, { Dayjs } from 'dayjs'

import useForm from '../../hooks/useForm';
import { formatDataToOptions, getDisplayText, validateRowCol } from '../../shared/utils';
import { FormDisplayType, FormRowCol } from '../../shared/types';
import useFun from '../../hooks/useFun';

export interface FunFormItemProps {
  rowCol?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24
  displayType?: FormDisplayType
  displayTextEmpty?: string
}

export interface FormItemCommonProps extends AntFormItemProps, FunFormItemProps {}

// 可选择的组件，如：Select、Radio、Checkbox等
export interface FormItemOptionalProps extends FormItemCommonProps {
  labelKey?: string
  valueKey?: string
  childrenKey?: string
}

const getPlaceholder = (props: any, componentName: string): string => {
  let { placeholder } = props
  if (placeholder) return placeholder
  if (componentName === 'Input') {
    placeholder = '请输入'
  }
  if (['Select', 'Cascader'].includes(componentName)) {
    placeholder = '请选择'
  }
  return placeholder
}

const AntFormItem = AntForm.Item
export function withFormItem(WrappedComponent: any) {
  return (props: any) => {
    let {
      rowCol,
      displayType,
      displayTextEmpty,
      isNumber,
      // 请求接口相关
      dataFunc,
      dataApi,
      dataApiReqData = {},
      dataApiMethod = 'get',
      resDataPath,
      // 可选组件相关
      labelKey = 'label',
      valueKey = 'value',
      childrenKey = 'children',
      // 针对RangePicker可以拆分成两个字段
      names,
      format = 'YYYY-MM-DD HH:mm:ss',
      showTime = {
        defaultValue: [dayjs('00:00:00', 'HH:mm:ss'), dayjs('23:59:59', 'HH:mm:ss')]
      },
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
    const [noFormItemNameValue, setNoFormItemNameValue] = useState<any>(componentName === 'RangePicker' && names?.length === 2 && initialValue?.length ? [dayjs(initialValue[0]), dayjs(initialValue[1])] : []) // 兼容 RangePicker names 等
    const { request } = useFun()

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
      init()
    }, []);

    const init = async () => {
      if (!dataApi && !dataFunc) return
      try {
        setLoading(true)
        let res = dataApi ? await request[dataApiMethod](dataApi, dataApiReqData) : await dataFunc(dataApiReqData)
        res = resDataPath ? get(res, resDataPath) : res
        res = formatDataToOptions(res, labelKey, valueKey, childrenKey)
        setOptions(res)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    const currentRules = required ? (rules || [{ required: true, message: `${label}为必填字段` }]) : []

    // displayType为text时，优先展示当前FormItem设置的属性
    const currentDisplayType = displayType || formDisplayType
    const currentDisplayTextEmpty = displayTextEmpty || formDisplayTextEmpty

    const getDisplayValue = () => {
      const formItemValue = form.getFieldValue(name)
      if (!isDef(formItemValue)) return currentDisplayTextEmpty
      if (['Select', 'Cascader', 'Radio', 'Checkbox'].includes(componentName) && options?.length) {
        return getDisplayText(options, formItemValue, '，') || currentDisplayTextEmpty
      }
      if (['RangePicker'].includes(componentName) && names?.length === 2) {
        const start = form.getFieldValue(names[0]) || currentDisplayTextEmpty
        const end = form.getFieldValue(names[1]) || currentDisplayTextEmpty
        return start + ' ~ ' + end
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
      if (!names && prevValue[name] === curValue[name]) return false
      if (isNumber && componentName === 'Input') {
        const currentFormItemValue = curValue[name]
        if (typeof currentFormItemValue === 'string') {
          curValue[name] = parseInt(currentFormItemValue)
        }
      }
      if (names?.length === 2 && componentName === 'RangePicker' && curValue[names[0]] && curValue[names[1]]) {
        const startValue = curValue[names[0]]
        const endValue = curValue[names[1]]
        setNoFormItemNameValue([dayjs(startValue), dayjs(endValue)])
      }
      return true
    }

    const handleRangeChange = (dates: [Dayjs, Dayjs] | null, dateStrings: [string, string]) => {
      if (names?.length === 2 && dates) {
        const [startTimeName, endTimeName] = names;
        form.setFieldsValue({
          [startTimeName]: dates[0].format(format),
          [endTimeName]: dates[1].format(format),
        })
      }
      setNoFormItemNameValue(dates)
      wrappedComponentProps.onChange && wrappedComponentProps.onChange(dates, dateStrings)
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
      } else if (['RangePicker'].includes(componentName)) {
        if (names?.length === 2) {
          return (
            <>
              {
                names.map((n: any, index: number) =>
                  <AntFormItem
                    name={n}
                    key={n}
                    initialValue={initialValue?.[index]}
                    hidden
                    shouldUpdate={defaultShouldUpdate}
                  ><Input/></AntFormItem>
                )
              }
              <WrappedComponent
                {...wrappedComponentProps as any}
                style={wrappedComponentProps.style || { width: '100%' }}
                showTime={showTime}
                format={format}
                onChange={wrappedComponentProps.onChange ? wrappedComponentProps.onChange : names ? handleRangeChange : undefined}
                value={noFormItemNameValue}
                placeholder={getPlaceholder(props, componentName)}
                disabled={wrappedComponentProps.disabled || currentDisplayType === 'disabled'}
              />
            </>
          )
        }
        return (
          <WrappedComponent
            {...wrappedComponentProps as any}
            format={format}
            onChange={wrappedComponentProps.onChange ? wrappedComponentProps.onChange : names ? handleRangeChange : undefined}
            placeholder={getPlaceholder(props, componentName)}
            disabled={wrappedComponentProps.disabled || currentDisplayType === 'disabled'}
          />
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
          <AntFormItem
            {...commonAntFormItemProps}
            rules={currentRules}
            hidden={formCollapse && collapseNames.includes(name) && direction === 'horizontal' || hidden}
            normalize={normalize || defaultNormalize}
            shouldUpdate={shouldUpdate || defaultShouldUpdate}
          >
            {buildComponent()}
          </AntFormItem>
        )
      }
      // 文字展示
      return (
        <AntFormItem
          {...commonAntFormItemProps}
        >
          <div className="fun-form-item-display-text">{getDisplayValue()}</div>
        </AntFormItem>
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
