import React from 'react'
import { Input as AntInput } from 'antd'
import { InputProps as AntInputProps } from 'antd/es/input/Input'

interface FormItemInputProps extends AntInputProps {
}

export const FormItemInput: React.FC<FormItemInputProps> = ({
  placeholder,
  ...antProps
}) => {
  return <AntInput placeholder={placeholder} {...antProps}/>
}

FormItemInput.defaultProps = {
  placeholder: '请输入'
}
