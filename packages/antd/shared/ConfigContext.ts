import React from 'react'
import { ConfigProviderProps } from 'antd'

export interface ConfigContextProps {
  api?: {
    baseURL?: string | Function // axios baseURL
    responseInterceptor?: (res: any) => any // 响应拦截器
  }
  antd?: {
    ConfigProviderProps?: ConfigProviderProps // 全局配置 https://ant.design/components/config-provider-cn#api
  }
}

const ConfigContext = React.createContext<ConfigContextProps | undefined>(undefined)

export default ConfigContext
