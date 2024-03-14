import React from 'react'
import { Badge as AntBadge } from 'antd'
import { BadgeProps as AntBadgeProps } from 'antd/es/badge/index'

interface BadgeProps extends AntBadgeProps {
}

export const Badge: React.FC<BadgeProps> = ({ children, ...antProps}) => {
  return <AntBadge {...antProps}>{children}</AntBadge>
}
