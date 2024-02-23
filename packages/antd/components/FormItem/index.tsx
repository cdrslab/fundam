import React from 'react'
import { Form, Col } from 'antd'
import { FormItemProps as AntFormItemProps } from 'antd/es/form/FormItem'

import useForm from '../../hooks/useForm'
import { validateRowCol } from '../../shared/utils'

interface FormItemProps extends AntFormItemProps {
  // TODO 自定义props？
  // name: string
  // label: string
  // children?: React.ReactNode
}

export const FormItem: React.FC<FormItemProps> = ({ children, ...antProps}) => {
  const { direction, rowCol  } = useForm()
  const formItem = <Form.Item {...antProps}>{children}</Form.Item>

  if (direction === 'horizontal') {
    validateRowCol(rowCol)
    const colSpan = 24 / rowCol
    return <Col span={colSpan}>{formItem}</Col>
  }
  return formItem
}
