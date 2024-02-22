import React from 'react'
import { Form, Col } from 'antd'
import { FormItemProps as AntFormItemProps } from 'antd/es/form/FormItem'

import useForm from '../../hooks/useForm'

interface FormItemProps extends AntFormItemProps {
  // TODO 自定义props？
  // name: string
  // label: string
  // children?: React.ReactNode
}

const FormItem: React.FC<FormItemProps> = ({ children, ...antProps}) => {
  const { direction } = useForm()
  const formItem = <Form.Item {...antProps}>{children}</Form.Item>

  if (direction === 'horizontal') {
    return <Col>{formItem}</Col>
  }
  return formItem
}

export default FormItem
