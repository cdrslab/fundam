import zhCN from 'antd/locale/zh_CN'
import { ConfigContextProps } from './ConfigContext'
import axios from 'axios'

export const defaultConfig: ConfigContextProps = {
  request: axios,
  antd: {
    ConfigProviderProps: {
      locale: zhCN
    }
  }
}
