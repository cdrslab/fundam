import { get, throttle } from 'lodash'
import queryString from 'query-string'
import { message } from 'antd'
import { NavigateFunction } from 'react-router/dist/lib/hooks'
import { FormInstance } from 'antd/es/form'

import { VALID_ROW_COLS } from './constants'

export const validateRowCol = (rowCol: number) => {
  if (!VALID_ROW_COLS.includes(rowCol)) {
    throw new Error(`rowCol value must be one of ${VALID_ROW_COLS.join(", ")}. Received ${rowCol}`)
  }
}

// 格式化options
interface OptionItem {
  label: string;
  value: any;
  children?: OptionItem[];
}
export function formatDataToOptions(data: Array<Record<string, any>>, labelKey: string = 'label', valueKey: string = 'value', childrenKey: string = 'children'): OptionItem[] {
  const options: OptionItem[] = [];

  data.forEach(item => {
    const option: OptionItem = {
      label: item[labelKey],
      value: item[valueKey]
    };

    if (item[childrenKey] && Array.isArray(item[childrenKey])) {
      option.children = formatDataToOptions(item[childrenKey], labelKey, valueKey, childrenKey);
    }

    options.push(option);
  });

  return options;
}

// 数据回显
type Option = {
  label: string;
  value: string | number;
  children?: Option[];
};
type Value = string | number | Value[] | Array<Value[]>;
function findLabelByValue(options: Option[], value: string | number, includeParent: boolean = false): string {
  for (const option of options) {
    if (option.value === value) {
      return includeParent ? option.label : '';
    }
    if (option.children) {
      const childLabel = findLabelByValue(option.children, value, true);
      if (childLabel) {
        return includeParent ? option.label + '-' + childLabel : childLabel;
      }
    }
  }
  return '';
}
export function getDisplayText(options: Option[], value: Value, separator: string = ','): string {
  if (Array.isArray(value)) {
    if (value.length > 0 && Array.isArray(value[0])) {
      // 处理二维数组的情况 (如：Cascader-多选)
      return (value as Array<Value[]>).map(valArray => {
        let labels = valArray.map((val: any) => findLabelByValue(options, val, true));
        labels = labels.filter(label => label !== '');
        return labels.length ? labels[labels.length - 1] : '';
      }).join(separator);
    } else {
      // 处理一维数组的情况 (如：Select-多选)
      return (value as Value[]).map(val => findLabelByValue(options, val as string | number, true)).join(separator);
    }
  } else {
    // 处理单个值的情况 (如：Select-单选)
    return findLabelByValue(options, value as string | number, true);
  }
}

// form item 组件公共部分
export const getFormItemDefaultData = (formItemProps: Record<string, any>, _params = {}) => {
  const currentRules = formItemProps.required ? (formItemProps.rules || [{ required: true, message: `${formItemProps.label || '该字段'}为必填字段` }]) : []

  return {
    currentRules
  }
}

// 组件自适应请求
export const getData = async (data: any, request: any) => {
  if (!data || !request) return data
  const { dataApi, dataFunc, dataApiReqData = {}, dataApiMethod = 'get', resDataPath = '' } = data as any
  if (!dataApi && !dataFunc) return data
  let res = dataApi ? await request[dataApiMethod](dataApi, dataApiReqData) : await dataFunc(dataApiReqData)
  res = resDataPath ? get(res, resDataPath) : res
  return res
}

interface QueryParams {
  [key: string]: any;
}

// 联动表达式执行
export const evaluateExpression = (
  expression: string,
  form: FormInstance,
  query: QueryParams = {},
  _names: string[] // TODO 多层name，Form.List中用到的？--暂不需要
): any => {
  const formValues = form.getFieldsValue()
  const context = { ...query, ...formValues }
  const contextKeys = Object.keys(context).join(", ")
  const contextValues = Object.keys(context).map(key => context[key])

  try {
    const func = new Function(contextKeys, `return ${expression};`)
    return func(...contextValues)
  } catch (error) {
    console.error('Error evaluating expression with Function:', error)
    return undefined
  }
}

// 自动收集依赖
type ExtractDependenciesFromString = (expression: string) => string[];
export const extractDependenciesFromString: ExtractDependenciesFromString = (expression) => {
  if (!expression) return []

  const regex = /(?:^|[^.\w])(?!Query\.)[a-zA-Z_$][\w$]*/g
  let match
  const dependencies = new Set<string>()
  while ((match = regex.exec(expression)) !== null) {
    const dep = match[0].trim()
    if (!dep.startsWith('.') && !dep.startsWith('[')) {
      dependencies.add(dep)
    }
  }
  const filteredDeps = Array.from(dependencies).filter(dep => !dep.startsWith('Query.') && !dep.includes('=>'))
  return filteredDeps.map(dep => dep.replace(/^[^a-zA-Z_$]+/, ''))
}

// 处理Table中换行后的第一个按钮
export const adjustButtonMargins = () => {
  const buttons = document.querySelectorAll('.fun-table-row-button')
  let lastTop = 0
  buttons.forEach((button, index) => {
    const currentTop = button.getBoundingClientRect().top
    if (index === 0 || currentTop !== lastTop) {
      button.classList.add('fun-table-row-button-first')
    } else {
      button.classList.remove('fun-table-row-button-first')
    }
    lastTop = currentTop
  })
}

// 处理table按钮渲染（换行对齐）
export const throttledAdjustButtonMargins = throttle(adjustButtonMargins, 50)

// 复制
export const copyToClipboard = (text: string) => {
  if (!text) {
    message.error('复制失败')
    return
  }
  navigator.clipboard.writeText(text).then(
    () => message.success('复制成功'),
    () => message.error('复制失败')
  )
}

// 更新地址栏参数
export const updateURLWithRequestData = (navigate: NavigateFunction, requestData: Record<string, any> = {}, replace = false) => {
  if (!Object.keys(requestData)?.length) return
  const queryParams: any = queryString.parse(window.location.search)
  const qs = queryString.stringify(replace ? { ...requestData } : { ...queryParams, ...requestData })
  navigate(window.location.pathname + window.location.hash + '?' + qs)
}

// 基础类型数组批量删除元素，Table select row使用
export const arrayRemoveByValues = (array: Array<any>, values: Array<any>) => array.filter(i => !values.includes(i))

// 对象数组批量删除元素
export const objArrayRemoveByValuesKey = (objArray: Array<Record<string, any>>, values: Array<Record<string, any>>, key: string) => {
  const valueKeys = values.map(i => i[key])
  return objArray.filter(item => !valueKeys.includes(item[key]))
}
// 去重
export const objArrayUnionByValuesKey = (objArray: Array<Record<string, any>>, values: Array<Record<string, any>>, key: string) => {
  const objArrayKeys = objArray.map(i => i[key])
  values.forEach(item => {
    if (objArrayKeys.includes(item[key])) return
    objArray.push(item)
  })
  return objArray
}
