import { get, throttle } from 'lodash'
import queryString from 'query-string'
import { message } from 'antd'
import { NavigateFunction } from 'react-router/dist/lib/hooks'
import { FormInstance } from 'antd/es/form'

import { FORCE_UPDATE_QUERY_KEY, VALID_ROW_COLS } from './constants'
import { GetData, isURLSearchParams } from './types';
import { isDef } from '@fundam/utils';

export const validateRowCol = (rowCol: number) => {
  if (!VALID_ROW_COLS.includes(rowCol)) {
    throw new Error(`rowCol value must be one of ${VALID_ROW_COLS.join(", ")}. Received ${rowCol}`)
  }
}

// 格式化options
interface OptionItem {
  label: string
  value: any
  isLeaf?: boolean // false-还下一层，兼容cascade - 远程加载数据
  children?: OptionItem[]
}
export function formatDataToOptions(data: Array<Record<string, any>>, labelKey: string = 'label', valueKey: string = 'value', childrenKey: string = 'children', isLeafKey: string = 'isLeaf'): OptionItem[] {
  const options: OptionItem[] = [];

  try {
    data.forEach(item => {
      const option: OptionItem = {
        label: item[labelKey],
        value: item[valueKey]
      };

      if (item[childrenKey] && Array.isArray(item[childrenKey])) {
        option.children = formatDataToOptions(item[childrenKey], labelKey, valueKey, childrenKey);
      }

      if (isDef(item[isLeafKey])) {
        option.isLeaf = item[isLeafKey]
      }

      options.push(option);
    })
  } catch (e) {

  }

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

export const filterIgnoreFunValues = (values: Record<string, any>, filterRemoteSearchText: boolean = false) => {
  const newValues: Record<string, any> = {}
  Object.keys(values).forEach(key => {
    // 移除Fundam隐藏字段（__开头）
    if (key.startsWith('__')) {
      // 过滤远程搜索文案
      if (filterRemoteSearchText) return
      // 远程搜索的文案-不过滤，如__idText，以__开头+Text结尾
      if (!filterRemoteSearchText && !key.endsWith('Text')) return
    }
    newValues[key] = values[key]
  })
  return newValues
}

// 组件自适应请求
export const getData = async (data: GetData, request: any) => {
  if (!data || !request) return data
  const { dataApi, dataFunc, dataApiReqData = {}, dataApiMethod = 'get', dataRule = true, resDataPath = '' } = data as any
  if (!dataApi && !dataFunc) return null
  if (!dataRule || (typeof dataRule === 'function' && !dataRule())) return null

  if (dataFunc) {
    const res = await dataFunc(dataApiReqData)
    return res
  }

  if (dataApiMethod === 'get' && dataApi && dataApiReqData) {
    Object.keys(dataApiReqData).forEach((key: string) => {
      if (Array.isArray(dataApiReqData[key])) {
        dataApiReqData[key] = dataApiReqData[key].join(',')
      }
    })
  }

  let res = await request[dataApiMethod](dataApi, filterIgnoreFunValues(dataApiReqData, true))
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
  const qs = queryString.stringify(replace ? { ...requestData } : { ...queryParams, ...requestData }, { arrayFormat: 'comma' })
  navigate(window.location.pathname + window.location.hash + '?' + qs, { replace: true })
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

export const forceUpdateByPath = (path: string) => {
  const updateTime = new Date().getTime()
  if (path.includes('?')) {
    path = path + '&' + FORCE_UPDATE_QUERY_KEY + '=' + updateTime
  } else {
    path = path + '?' + FORCE_UPDATE_QUERY_KEY + '=' + updateTime
  }
  return path
}

// 通过 useSearchParams 获取query，queryCache：不改变query的引用
export const getQueryBySearchParams = (searchParams: any, parseValueKeys: Array<string> = [], ignoreQueryKeys: Array<string> = [], queryCache: any = {}) => {
  // 存在getAll 为 URLSearchParams 类型
  const realQuery = searchParams?.getAll ? Object.fromEntries([...searchParams]) : searchParams
  const query: any = queryCache || {}
  Object.keys(realQuery).forEach(key => {
    if (realQuery[key] === 'undefined' || realQuery[key] === 'null' || !isDef(realQuery[key])) return
    // 隐藏字段
    if (key.startsWith('__') || ignoreQueryKeys.includes(key)) return
    try {
      realQuery[key] = parseValueKeys.includes(key) ? JSON.parse(realQuery[key]) : realQuery[key]
    } catch (e) {
    } finally {
      query[key] = realQuery[key]
    }
  })

  return {
    realQuery,
    query
  }
}

// 转换url为 query 参数对象
export function parseQueryParams(url: string, parseQueryKeys: string[]): Record<string, any> {
  const queryString = url.split('?')[1]
  if (!queryString) return {}

  const params = new URLSearchParams(queryString)
  const parsedParams: Record<string, any> = {}

  // @ts-ignore
  for (const [key, value] of params) {
    if (parseQueryKeys.includes(key)) {
      const numValue = Number(value)
      if (!isNaN(numValue)) {
        parsedParams[key] = numValue
      } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
        parsedParams[key] = value.toLowerCase() === 'true'
      } else {
        parsedParams[key] = value
      }
    } else {
      parsedParams[key] = value
    }
  }

  return parsedParams
}

export function removeLastDotAndAfter(str: string): string {
  const lastIndex = str.lastIndexOf('.')
  if (lastIndex === -1) {
    return str
  }
  return str.substring(0, lastIndex)
}


const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.tiff']
export const isImageResource = (url: string): boolean => {
  if (!url) return false
  const urlWithoutParams = url.split('?')[0]
  return imageExtensions.some(ext => urlWithoutParams.toLowerCase().endsWith(ext))
}

export const getFileType = (url: string): string => {
  if (!url) return 'unknown'
  const urlWithoutParams = url.split('?')[0]
  const urlArray = urlWithoutParams.split('.')
  return urlArray[urlArray.length - 1].toLowerCase()
}

const fileIconClass: Record<string, string> = {
  doc: 'icon-file-doc',
  '7z': 'icon-file-7z',
  eps: 'icon-file-eps',
  csv: 'icon-file-csv',
  mov: 'icon-file-mov',
  mp4: 'icon-file-mp4',
  txt: 'icon-file-txt',
  pdf: 'icon-file-pdf',
  rar: 'icon-file-rar',
  ppt: 'icon-file-ppt',
  psd: 'icon-file-psd',
  xls: 'icon-file-xls',
  xlsx: 'icon-file-xlsx',
  svg: 'icon-file-svg',
  zip: 'icon-file-zip',
}
export const getFileIconByUrl = (url: string): string => {
  if (!url) return 'icon-file-empty'
  const fileType = getFileType(url)
  return fileIconClass[fileType] || 'icon-file-empty'
}

export const downloadFileByFetch = async (file: any, urlKey: string = 'url', nameKey: string = 'name') => {
  const link = document.createElement('a')

  const downloadBlob = (url: string, filename: string) => {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob)
        link.href = blobUrl
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(blobUrl)
      })
      .catch(error => {
        console.error('Error downloading file:', error)
      })
  }

  if (typeof file === 'string') {
    const fileType = getFileType(file)
    const filename = 'file.' + fileType
    downloadBlob(file, filename)
  } else {
    const filename = file[nameKey] || file?.extra?.[nameKey] || 'file'
    downloadBlob(file[urlKey], filename)
  }
}

export const downloadFile = (file: any, urlKey: string = 'url', nameKey: string = 'name') => {
  const link = document.createElement('a')
  if (typeof file === 'string') {
    const fileType = getFileType(file)
    link.href = file
    link.download = 'file.' + fileType
  } else {
    link.href = file[urlKey]
    link.download = file[nameKey] || file?.extra?.[nameKey] || 'file'
  }
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
