// @ts-ignore
import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { Button, Cascader, Checkbox, Col, Form, Input, message, Radio, Select } from 'antd'
import { isDef } from '@fundam/utils'
import { useLocalStorage } from '@fundam/hooks'
import { FormItemProps as AntFormItemProps } from 'antd/es/form/FormItem'
import { debounce, get } from 'lodash'

import { useForm } from '../../hooks/useForm';
import { useFun } from '../../hooks/useFun'
import { copyToClipboard, formatDataToOptions, getData, getDisplayText } from '../../shared/utils'
import { FormDisplayType, GetData } from '../../shared/types'
import { FormItem } from '../FormItem'
import { CopyOutlined } from '@ant-design/icons';

export interface FunFormItemProps {
  rowCol?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24
  displayType?: FormDisplayType
  displayTextEmpty?: string
  copyable?: boolean // 可复制
  copyText?: string // 复制展示
  noLabel?: boolean // 不展示label（关联设置colon）
  visibleRule?: (() => boolean) | string | boolean
  observe?: Array<string>
  needInitFetch?: boolean // 是否需要首次请求（用于select、cascade等初始化数据），默认请求
}

export interface FormItemCommonProps extends Omit<AntFormItemProps, 'tooltip' | 'extra'>, FunFormItemProps {
  tooltip?: string | GetData | ReactNode
  extra?: string | GetData | ReactNode
  options?: Array<any>
  searchKey?: string // 远程搜索key
  loadDataKey?: string // 动态加载接口key（注意：antd官方 - 不允许loadData 与 search混用，故可以公用 GetData 相关属性）
  loadDataMaxLayer?: number // 前端控制cascade远程加载的层数
}

// 可选择的组件，如：Select、Radio、Checkbox等
export interface FormItemOptionalProps extends FormItemCommonProps {
  labelKey?: string
  valueKey?: string
  childrenKey?: string
  isLeafKey?: string // 服务端控制cascade远程加载的层数
}

export function withFormItem(WrappedComponent: any) {
  return (props: any) => {
    const {
      // formItem新增props
      visibleRule, // 表达式 & Func 计算是否展示组件
      observe, // 监听 变化 => 触发 visibleRule 重新计算
      searchKey, // 远程搜索key
      loadDataKey, // 动态加载接口key（Cascade）
      loadDataMaxLayer,

      rowCol,
      displayType,
      displayTextEmpty,
      needInitFetch = true,
      noLabel = false,
      isNumber,
      copyable = false,
      copyText = '',
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
      isLeafKey = 'isLeaf',
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
      onChange,
      // Form.Item子组件：Input、Select等的props
      ...wrappedComponentProps
    } = props

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

    const formItemValue = Form.useWatch(name, form as any)

    useEffect(() => {
      if (!needInitFetch) {
        initRef.current = true
        return
      }
      if (!initRef.current) {
        init()
        initRef.current = true
      }
    }, [])

    useEffect(() => {
      // 处理cascade + loadData回显
      if (!formItemValue || options?.length || WrappedComponent !== Cascader || !loadDataKey) return
      initCascadeText()
    }, [formItemValue])

    const initCascadeText = async () => {
      const cascadeInitOptions = await loadCascadeData(formItemValue, [...formItemValue], formItemValue.length)
      setOptions(cascadeInitOptions)
    }

    const loadCascadeData = async (formItemValue: Array<any>, currentFormItemValue: Array<any>, depth: number, layer: number = 1) => {
      if (depth === 0 || !formItemValue) return []

      const currentDataApiReqData = { ...dataApiReqData }
      if (layer !== 1) {
        currentDataApiReqData[loadDataKey] = formItemValue[layer - 2]
      }
      const currentRes = await getData({
        dataApi,
        dataFunc,
        dataApiMethod,
        resDataPath,
        dataApiReqData: currentDataApiReqData,
      }, request)
      let formattedRes = formatDataToOptions(currentRes, labelKey, valueKey, childrenKey, isLeafKey)

      if (depth === 1) {
        if (loadDataMaxLayer) {
          formattedRes = formattedRes.map((item: any) => ({ ...item, isLeaf: layer === loadDataMaxLayer }))
        }
        return formattedRes
      } else {
        formattedRes = formattedRes.map((item: any) => ({ ...item, isLeaf: false }))
        const childData = await loadCascadeData(formItemValue, currentFormItemValue.slice(1), depth - 1, layer + 1)
        formattedRes.forEach((item: any) => {
          if (item.value === formItemValue[layer - 1]) {
            item.children = childData
          }
        })
        return formattedRes
      }
    }

    // 设置Select、Radio等options
    const init = async () => {
      if (!dataApi && !dataFunc) return
      try {
        setLoading(true)
        if (optionsCache) {
          setOptions(optionsCache)
          return
        }
        if (WrappedComponent === Cascader && loadDataKey) return

        const res = await fetchData()
        if (!searchKey) {
          cacheKey && setOptionsCache(res)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    const optionsFormat = (optionValues: any) => {
      if (WrappedComponent !== Cascader || !loadDataKey) return formatDataToOptions(optionValues, labelKey, valueKey, childrenKey)
      if (loadDataMaxLayer) {
        // 前端控制层数
        const formItemValue = form.getFieldValue(name)
        return formItemValue?.length === loadDataMaxLayer - 1 ? optionValues : optionValues.map((item: any) => ({ ...item, isLeaf: false }))
      }
      // 服务端控制层数
      return formatDataToOptions(optionValues, labelKey, valueKey, childrenKey, isLeafKey)
    }

    const fetchData = async (params: Record<string, any> = {}) => {
      let res = dataApi ? await request[dataApiMethod](dataApi, { ...dataApiReqData, ...params }) : await dataFunc({ ...dataApiReqData, ...params })
      res = resDataPath ? get(res, resDataPath) : res
      res = optionsFormat(res)
      setOptions(res)
      return res
    }

    const currentRules = required ? (rules || [{ required: true, message: `${label || '该字段'}为必填字段` }]) : []

    // displayType为text时，优先展示当前FormItem设置的属性
    const currentDisplayType = displayType || formDisplayType
    const currentDisplayTextEmpty = displayTextEmpty || formDisplayTextEmpty

    const getDisplayValue = () => {
      const formItemValue = form.getFieldValue(name)
      if (!isDef(formItemValue)) return currentDisplayTextEmpty
      if ((WrappedComponent === Select || WrappedComponent === Cascader || WrappedComponent === Radio || WrappedComponent === Checkbox) && options?.length) {
        return getDisplayText(options, formItemValue, '，') || currentDisplayTextEmpty
      }
      return formItemValue
    }

    const defaultNormalize = (value: any, prevValue: any) => {
      if (!isNumber || WrappedComponent !== Input) return value
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
      if (isNumber && WrappedComponent === Input) {
        const currentFormItemValue = curValue[name]
        if (typeof currentFormItemValue === 'string') {
          curValue[name] = parseInt(currentFormItemValue)
        }
      }
      if (WrappedComponent === Select || WrappedComponent === Cascader || WrappedComponent === Checkbox) {
        // 多选数组，自动处理逗号分隔的值
        if (curValue[name] && typeof curValue[name] === 'string') {
          curValue[name] = wrappedComponentProps.mode ? curValue[name].split(',') : curValue[name]
        }
        // 远程搜索，回显
        if (searchKey && curValue['__' + name + 'Text'] && curValue[name] && !options?.length) {
          const currentValueText = curValue['__' + name + 'Text']
          if (wrappedComponentProps.mode) {
            setOptions(currentValueText.split(',').map((item: string, index: number) => ({ label: item, value: curValue[name][index] })))
          } else {
            setOptions([{ label: currentValueText, value: curValue[name] }])
          }
        }
      }
      return true
    }

    // Select等远程搜索
    const onSearch = debounce((val = '') => fetchData({ [searchKey]: val }), 300)

    // Cascade - loadData兼容
    const loadData = async (selectedOptions: any[]) => {
      const targetOption = selectedOptions[selectedOptions.length - 1]

      let res = await getData({
        dataApi,
        dataFunc,
        dataApiMethod,
        resDataPath,
        dataApiReqData: { ...dataApiReqData, [loadDataKey]: targetOption.value }
      }, request)

      if (isLeafKey) {
        // 服务端控制是否还有下一级
        res = formatDataToOptions(res, labelKey, valueKey, childrenKey, isLeafKey)
      }


      if (loadDataMaxLayer) {
        res = optionsFormat(res)
      }

      targetOption.children = res

      setOptions([...options])
    }

    const getPlaceholder = (): string => {
      const { placeholder } = wrappedComponentProps
      if (placeholder) return placeholder
      if (WrappedComponent === Input || WrappedComponent === Input.TextArea) {
        return '请输入'
      }
      if (WrappedComponent === Select || WrappedComponent === Cascader) {
        return '请选择'
      }
      return placeholder
    }

    const buildComponent = () => {
      if (searchKey) {
        // 需要远程搜索 - 兼容配置
        wrappedComponentProps.onSearch = onSearch
        wrappedComponentProps.showSearch = true
        wrappedComponentProps.filterOption = false
        wrappedComponentProps.onFocus = () => onSearch()
        wrappedComponentProps.onChange = (val: any, kv: any) => {
          if (Array.isArray(kv)) {
            form.setFieldsValue({
              ['__' + name + 'Text']: kv.map(item => item.label).join(',')
            })
          } else {
            form.setFieldsValue({
              ['__' + name + 'Text']: kv.label
            })
          }
          onChange && onChange(val, kv)
        }
      }
      if (loadDataKey) {
        // Cascade - loadData兼容
        wrappedComponentProps.loadData = loadData
      }
      if (WrappedComponent === Select || WrappedComponent === Cascader) {
        return (
          <WrappedComponent
            {...wrappedComponentProps as any}
            options={options}
            loading={loading}
            placeholder={getPlaceholder()}
            disabled={wrappedComponentProps.disabled || currentDisplayType === 'disabled'}
          />
        )
      } else if (WrappedComponent === Radio || WrappedComponent === Checkbox) {
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
          placeholder={getPlaceholder()}
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
          <>
            {
              searchKey ?
                <FormItem
                  hidden
                  name={'__' + name + 'Text'}
                  shouldUpdate={defaultShouldUpdate}
                >
                  <Input/>
                </FormItem>
                :
                null
            }
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
          </>
        )
      }
      const text = getDisplayValue()
      // 文字展示
      return (
        <FormItem
          {...commonAntFormItemProps}
          label={noLabel ? ' ' : label}
          colon={!noLabel}
          visibleRule={visibleRule}
          observe={observe}
        >
          <div className="fun-form-item-display-text">
            {text}
            {
              copyable && text !== currentDisplayTextEmpty ?
                <Button
                  type="link"
                  icon={!copyText ? <CopyOutlined /> : null}
                  style={{ padding: '0 0 0 2px', width: 'auto' }}
                  onClick={() => {
                    copyToClipboard(text)
                  }}
                >{copyText}</Button>
                : null
            }
          </div>
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
