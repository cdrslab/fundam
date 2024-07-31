import { useMemo } from 'react'
import { FunConfigProvider } from '@fundam/antd'
import { message } from 'antd'
import { createAPI } from '@fundam/utils'

// 仅文档展示使用
export const MockContainer = ({ children }: any) => {
  const request = useMemo(() => createAPI({
    baseURL: '/api',
  }, (res: any) => {
    const { data } = res
    if (!data.success) {
      message.error(data.error?.message ?? '请求失败，请重试')
      return Promise.reject(data)
    }
    return data.data || data.success
  }, (error: any) => {
    // TODO 异常处理...
    throw error
  }), [])

  return (
    <FunConfigProvider
      request={request}
    >
      {children}
    </FunConfigProvider>
  )
}

export const ShowCode = ({ title, children }: any) => {
  return (
    <div style={{ marginTop: 24, width: '100%' }}>
      <div style={{ marginBottom: 12 }}>{title}</div>
      <div
        style={{
          whiteSpace: 'pre',
          background: 'rgb(244, 244, 244)',
          width: '100%',
          minHeight: 96,
          padding: 12,
          borderRadius: 4,
          marginRight: 24,
          boxSizing: 'border-box'
        }}
      >
        {children}
      </div>
    </div>
  )
}
