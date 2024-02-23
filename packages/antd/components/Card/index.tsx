import React from 'react'
import { Card as AntCard } from 'antd'
import { CardProps as AntCardProps } from 'antd/es/card/Card'

interface CardProps extends AntCardProps {
}

export const Card: React.FC<CardProps> = ({ children, ...antProps}) => {
  return <AntCard {...antProps}>{children}</AntCard>
}
