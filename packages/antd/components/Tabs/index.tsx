import React from 'react'
import { Tabs as AntTabs } from 'antd'
import { TabsProps as AntTabsProps } from 'antd/es/tabs/index'

interface TabsProps extends AntTabsProps {
}

export const Tabs: React.FC<TabsProps> = ({ ...antProps}) => {
  return <AntTabs {...antProps}/>
}
