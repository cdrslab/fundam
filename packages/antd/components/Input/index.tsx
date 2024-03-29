import React from 'react'
import { Input as AntInput } from 'antd'
import { InputProps as AntInputProps } from 'antd/es/input/Input'

interface InputProps extends AntInputProps {
}

export const Input: React.FC<InputProps> = ({
  placeholder,
  ...antProps
}) => {
  return <AntInput placeholder={placeholder} {...antProps}/>
}

Input.defaultProps = {
  placeholder: '请输入'
}
