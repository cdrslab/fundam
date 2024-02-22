// AI处理：数据转化
// EDIT_PAGE 可以动态变为 VIEW_PAGE


// api baseURL
// const FunConfigProvider = (props) => {
//   const { getResourceType } = props.api
// }

// 实现 scope， 随意操作组件及其props

// TODO 核心目标：手写一部分、搭建一部分、AI处理一部分
// 手写部分：接口 & 接口请求、响应数据转换、复杂联动
// 系统处理：data收集、method收集


// 组件渲染、生命周期

import React, { useEffect } from 'react'

import data from './data.js'
import method from './method.js'
import schema from './schema.js'

export default () => {
  // = method.init
  // useEffect(() => {
  //   init()
  // }, [])
  //
  // const init = () => {
  //
  // }

  return (
    <Fundam data={data} method={method} schema={schema} />
  )
}

