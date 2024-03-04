import zhCN from 'antd/locale/zh_CN'
import { ConfigContextProps } from './ConfigContext'

export const defaultConfig: ConfigContextProps = {
  api: {
    baseURL: '',
    responseInterceptor: (res) => res
  },
  antd: {
    ConfigProviderProps: {
      locale: zhCN
    }
  }
}
