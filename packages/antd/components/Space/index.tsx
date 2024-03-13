import React from 'react'
import { Space as AntSpace } from 'antd'
import { SpaceProps as AntSpaceProps } from 'antd/es/space/index'

interface SpaceProps extends AntSpaceProps {
}

export const Space: React.FC<SpaceProps> = ({ children, ...antProps}) => {
  return <AntSpace {...antProps}>{children}</AntSpace>
}
