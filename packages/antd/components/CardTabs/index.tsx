import React from 'react'
import { Tabs as AntTabs } from 'antd'
import { TabsProps as AntTabsProps } from 'antd/es/tabs/index'

import './index.less'

interface TabsProps extends AntTabsProps {
}

export const CardTabs: React.FC<TabsProps> = ({ ...antProps}) => {
  return (
    <div className="fun-card-tabs">
      <AntTabs {...antProps}/>
    </div>
  )
}
