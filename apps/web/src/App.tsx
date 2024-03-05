import { useMemo } from 'react'
import List from './examples/list_page/List';

import './app.css'
import { FunConfigProvider } from '@fundam/antd/components/FunConfigProvider';
import { message } from 'antd';
import { createAPI } from '@fundam/utils/request';

// 模拟不同环境不同baseURL
const getBaseURL = () => {
  if (window.location.host.includes('.test.')) return '//localhost:5174'
  return '//localhost:5174'
}

const App = () => {
  const request = useMemo(() => createAPI({
    baseURL: getBaseURL(),
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

  return (
    <FunConfigProvider
      request={request}
    >
      <div className="app-container">
        <div className="menus">模拟菜单占位</div>
        <div className="main-content">
          <div className="top-bar">模拟导航条占位</div>
          <div className="content">
            <List/>
          </div>
        </div>
      </div>
    </FunConfigProvider>
  )
}

export default App
