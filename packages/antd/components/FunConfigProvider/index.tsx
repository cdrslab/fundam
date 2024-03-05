import React from 'react'
import { ConfigProvider } from 'antd'

import ConfigContext, { ConfigContextProps } from '../../shared/ConfigContext'
import { defaultConfig } from '../../shared/defaultConfig';

export const FunConfigProvider: React.FC<ConfigContextProps & { children: any }> = ({ request, antd, children }) => {
  const providerValue = {
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
