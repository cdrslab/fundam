import React from 'react'
import { Input as AntInput } from 'antd'
import { InputProps as AntInputProps } from 'antd/es/input/Input'

interface InputProps extends AntInputProps {
}

export const Input: React.FC<InputProps> = ({ ...antProps}) => {
  return <AntInput {...antProps}/>
}
