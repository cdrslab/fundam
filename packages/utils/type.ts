export const isUndef = (v: any): boolean => v === undefined || v === null
export const isDef = (v: any): boolean => v !== undefined && v !== null
// 字符串数组判断
export const isStringArray = (arr: any): boolean => {
  if (Array.isArray(arr)) {
    return arr.every(item => typeof item === 'string')
  }
  return false
}

export const isNumeric = (input: string | number): boolean => {
  const numericRegex = /^-?\d*\.?\d+$/
  return numericRegex.test(input.toString())
}

export const stringToNumber = (input: number | string) => {
  const num = Number(input)

  if (!isNaN(num)) return num
  return null
}

// 将对象中与objToNumber匹配的字段转换为数字类型
export const convertObjectToNumbers = (obj: any, objToNumber: string[]): any => {
  let convertedObject = { ...obj }

  for (const key of objToNumber) {
    if (key in obj) {
      const value = obj[key]

      if (Array.isArray(value)) {
        convertedObject[key] = value.map((item) => Number(item))
      } else {
        convertedObject[key] = Number(value)
      }
    }
  }

  return convertedObject
}
