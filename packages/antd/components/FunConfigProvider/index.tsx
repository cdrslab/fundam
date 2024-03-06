import React from 'react'
import { ConfigProvider } from 'antd'

import ConfigContext, { ConfigContextProps } from '../../shared/ConfigContext'
import { defaultConfig } from '../../shared/defaultConfig';

export const FunConfigProvider: React.FC<ConfigContextProps & { children: any }> = ({ request, antd, children }) => {
  const antConfigProviderMerge = {
    ...defaultConfig.antd?.ConfigProviderProps,
    ...antd?.ConfigProviderProps
  }
  const providerValue = {
    antd: {
      ConfigProviderProps: antConfigProviderMerge
    },
    request
  }

  return (
    <ConfigContext.Provider value={providerValue}>
      <ConfigProvider {...antConfigProviderMerge}>
        {children}
      </ConfigProvider>
    </ConfigContext.Provider>
  )
}
