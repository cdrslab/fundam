import React from 'react'
import { ConfigProviderProps } from 'antd'

export interface ConfigContextProps {
  request?: any // 默认axios，请求发起对象，如：request.get request.post 等
  antd?: {
    ConfigProviderProps?: ConfigProviderProps // 全局配置 https://ant.design/components/config-provider-cn#api
  }
  alias?: Record<string, any>
  setAlias?: (name: string, value: any) => void
  getAlias?: (name: string) => any
  getAllAlias?: () => any
}

const ConfigContext = React.createContext<ConfigContextProps | undefined>(undefined)

export default ConfigContext
