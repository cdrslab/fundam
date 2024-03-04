import React, { useMemo } from 'react'
import { ConfigProvider, message } from 'antd'
import { createAPI } from '@fundam/utils/request'

import ConfigContext, { ConfigContextProps } from '../../shared/ConfigContext'
import { defaultConfig } from '../../shared/defaultConfig';

export const FunConfigProvider: React.FC<ConfigContextProps & { children: any }> = ({ api, antd, children }) => {
  const request = useMemo(() => createAPI({
    baseURL: typeof api?.baseURL === 'function' ? api.baseURL() : api?.baseURL,
  }, (res: any) => {
    const { status, data } = res
    if (status >= 500) {
      return Promise.reject()
    }
    if (!data.ok) {
      message.error(data.error?.message ?? '请求失败，请重试')
      return Promise.reject(data)
    }
    return data.result || data.ok
  }, (error: any) => {
    if (error.response) {
      const { status } = error.response
      if (status === 401) {
        // TODO 跳转登录？
        return
      }
    }
    throw error
  }), [])

  const providerValue = {
    api: {
      baseURL: api?.baseURL || defaultConfig.api?.baseURL,
      responseInterceptor: api?.responseInterceptor || defaultConfig.api?.responseInterceptor
    },
    antd: {
      ConfigProviderProps: {
        ...defaultConfig.antd?.ConfigProviderProps,
        ...antd?.ConfigProviderProps
      }
    },
    request
  }

  return (
    <ConfigContext.Provider value={providerValue}>
      <ConfigProvider {...antd?.ConfigProviderProps}>
        {children}
      </ConfigProvider>
    </ConfigContext.Provider>
  )
}
