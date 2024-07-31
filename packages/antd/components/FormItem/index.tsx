import React, { useEffect, useRef, useState } from 'react'
import { Form } from 'antd'
import { isStringArray } from '@fundam/utils'
import queryString from 'query-string'
import { useLocation } from 'react-router-dom'

import { evaluateExpression, extractDependenciesFromString, getData } from '../../shared/utils'
import { useFun } from '../../hooks/useFun'
import { useForm } from '../../hooks/useForm'


const { Item: AntFormItem } = Form

export const FormItem: React.FC<any> = ({
  children,
  tooltip,
  extra,
  observe = [],
  visibleRule,
  ...antProps
}) => {
  const { name } = antProps
  const initRef = useRef(false)
  const { request } = useFun()
  const location = useLocation()
  const { form } = useForm()
  const [curTooltip, setCurTooltip] = useState<any>(null)
  const [curExtra, setCurExtra] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(true)

  const curObserve = observe?.length ? observe : extractDependenciesFromString(visibleRule)
  const watchValues = curObserve?.length ? curObserve?.map((item: string) => Form.useWatch(item, form as any)) : []

  // 依赖自动收集与联动实现
  useEffect(() => {
    evaluateVisibility()
  }, [JSON.stringify(watchValues), location.search])

  useEffect(() => {
    if (isVisible) return
    // 隐藏时，重置
    form.resetFields([name])
  }, [isVisible])

  useEffect(() => {
    if (!initRef.current) {
      init()
      initRef.current = true
    }
  }, [])

  const evaluateVisibility = () => {
    if (typeof visibleRule === 'string') {
      const queryParams: any = queryString.parse(location.search)
      setIsVisible(evaluateExpression(visibleRule, form as any, queryParams, name))
    } else if (typeof visibleRule === 'function') {
      setIsVisible(visibleRule())
    }
  }

  const init = async () => {
    if (typeof tooltip === 'string') {
      setCurTooltip(tooltip)
    }
    if (tooltip?.dataFunc || tooltip?.dataApi) {
      const tooltipRes = await getData(tooltip as any, request)
      setCurTooltip(isStringArray(tooltipRes) ? tooltipRes.join('\n') : tooltipRes)
    }

    if (typeof extra === 'string') {
      setCurExtra(extra)
    }
    if (extra?.dataFunc || extra?.dataApi) {
      const extraRes = await getData(extra as any, request)
      setCurExtra(isStringArray(extraRes) ? extraRes.join('\n') : extraRes)
    }
  }

  if ((typeof visibleRule === 'boolean' && !visibleRule) || (visibleRule && !isVisible)) return null

  // 默认为联动子项，靠近父级
  const style = antProps.label === ' ' && watchValues?.length && visibleRule ? {
    marginTop: '-24px'
  } : {}

  return (
    <AntFormItem
      {...antProps}
      tooltip={curTooltip}
      extra={curExtra}
      style={style}
    >
      {children}
    </AntFormItem>
  )
}
