import React, { useState } from 'react'
import { ConfigProvider } from 'antd'

import './index.less'
import ConfigContext, { ConfigContextProps } from '../../shared/ConfigContext'
import { defaultConfig } from '../../shared/defaultConfig'


export const FunConfigProvider: React.FC<ConfigContextProps & { children: any }> = ({ request, antd, children }) => {
  const [aliases, setAliases] = useState<Record<string, any>>({})
  const setAlias = (name: string, value: any) => {
    setAliases(prevAliases => ({
      ...prevAliases,
      [name]: value,
    }))
  }

  const getAlias = (name: string) => aliases[name]

  const getAllAlias = () => aliases

  const antConfigProviderMerge = {
    ...defaultConfig.antd?.ConfigProviderProps,
    ...antd?.ConfigProviderProps
  }

  const providerValue = {
    antd: {
      ConfigProviderProps: antConfigProviderMerge
    },
    request,
    alias: aliases,
    setAlias,
    getAlias,
    getAllAlias,
  }

  return (
    <ConfigContext.Provider value={providerValue}>
      <ConfigProvider {...antConfigProviderMerge}>
        {children}
      </ConfigProvider>
    </ConfigContext.Provider>
  )
}
