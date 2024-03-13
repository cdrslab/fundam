import React, { useEffect, useState } from 'react'
import { Form } from 'antd'
import { isStringArray } from '@fundam/utils'

import { getData, validateRowCol } from '../../shared/utils'
import useFun from '../../hooks/useFun'

const { Item: AntFormItem } = Form
export const FormItem: React.FC<any> = ({
  children,
  tooltip,
  extra,
  ...antProps
}) => {
  const [curTooltip, setCurTooltip] = useState(null)
  const [curExtra, setCurExtra] = useState(null)
  const { request } = useFun()

  useEffect(() => {
    init()
  }, []);

  const init = async () => {
    const tooltipRes = await getData(tooltip as any, request)
    const extraRes = await getData(extra as any, request)
    setCurTooltip(isStringArray(tooltipRes) ? tooltipRes.join('\n') : tooltipRes)
    setCurExtra(isStringArray(extraRes) ? extraRes.join('\n') : extraRes)
  }

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
