export const isUndef = (v: any): boolean => v === undefined || v === null
export const isDef = (v: any): boolean => v !== undefined && v !== null
// 字符串数组判断
export const isStringArray = (arr: any): boolean => {
  if (Array.isArray(arr)) {
    return arr.every(item => typeof item === 'string')
  }
  return false
}
