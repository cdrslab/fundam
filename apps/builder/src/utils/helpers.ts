// 生成唯一ID
export const generateId = (): string => {
  return `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 深拷贝对象
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T
  }
  
  if (typeof obj === 'object') {
    const cloned = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }
  
  return obj
}

// 格式化属性值
export const formatPropValue = (value: any, type: string): string => {
  if (value === undefined || value === null) {
    return 'undefined'
  }
  
  switch (type) {
    case 'string':
      return `"${value}"`
    case 'boolean':
      return value.toString()
    case 'number':
      return value.toString()
    case 'json':
      return JSON.stringify(value, null, 2)
    default:
      return JSON.stringify(value)
  }
}

// 驼峰转横线
export const camelToKebab = (str: string): string => {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase()
}

// 首字母大写
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}