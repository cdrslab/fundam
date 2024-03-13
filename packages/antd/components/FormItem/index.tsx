import React, { useEffect, useState } from 'react'
import { Form } from 'antd'
import { isStringArray } from '@fundam/utils'
import queryString from 'query-string'

import { evaluateExpression, getData } from '../../shared/utils'
import useFun from '../../hooks/useFun'
import useForm from '../../hooks/useForm';
import { useLocation } from '@fundam/hooks';

const { Item: AntFormItem } = Form

export const FormItem: React.FC<any> = ({
  children,
  tooltip,
  extra,
  observe = [],
  visibleRule,
  ...antProps
}) => {
  const { name, initialValue } = antProps
  const [curTooltip, setCurTooltip] = useState(null)
  const [curExtra, setCurExtra] = useState(null)
  const { request } = useFun()
  const { form } = useForm()
  const [isVisible, setIsVisible] = useState(true)
  const location = useLocation()

  useEffect(() => {
    init()
  }, [])

  useEffect(() => {
    evaluateVisibility()
  }, [observe.map((item: string) => !item.startsWith('Query.') && Form.useWatch(item, form as any)), location.search])

  useEffect(() => {
    if (isVisible) return
    // 隐藏时，重置
    form.resetFields([name])
  }, [isVisible]);

  const evaluateVisibility = () => {
    if (typeof visibleRule === 'string') {
      const queryParams: any = queryString.parse(location.search)
      setIsVisible(evaluateExpression(visibleRule, form as any, queryParams, name))
    } else if (typeof visibleRule === 'function') {
      setIsVisible(visibleRule())
    }
  }

  const init = async () => {
    const tooltipRes = await getData(tooltip as any, request)
    const extraRes = await getData(extra as any, request)
    setCurTooltip(isStringArray(tooltipRes) ? tooltipRes.join('\n') : tooltipRes)
    setCurExtra(isStringArray(extraRes) ? extraRes.join('\n') : extraRes)
  }

  if (isVisible === false) return null

  return (
    <AntFormItem
      {...antProps}
      tooltip={curTooltip as any}
      extra={curExtra as any}
    >
      {children}
    </AntFormItem>
  )
}
