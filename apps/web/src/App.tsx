import { useMemo, useState } from 'react'
import List from './examples/list_page/List';
import BaseForm from './examples/form_page/BaseForm';
import ListBasePage from './examples/list_base_page';

import './app.css'
import { FunConfigProvider } from '@fundam/antd/components/FunConfigProvider';
import { Button, message } from 'antd';
import { createAPI } from '@fundam/utils/request';

// 模拟不同环境不同baseURL
const getBaseURL = () => {
  if (window.location.host.includes('.test.')) return '//localhost:5174'
  return '//localhost:5174'
}

const RenderComponents = {
  list_base_page: ListBasePage,
  list: List,
  base_form: BaseForm,
}

const App = () => {
  const [renderComponent, setRenderComponent] = useState('list_base_page')
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

  // @ts-ignore
  const CurrentComponent = RenderComponents[renderComponent]
  return (
    <FunConfigProvider
      request={request}
    >
      <div className="app-container">
        <div className="menus">模拟菜单占位</div>
        <div className="main-content">
          <div className="top-bar">
            <Button onClick={() => setRenderComponent('list_base_page')} style={{ marginRight: 4 }}>基础列表</Button>
            <Button onClick={() => setRenderComponent('base_form')} style={{ marginRight: 4 }}>基础表单</Button>
            <Button onClick={() => setRenderComponent('list')}>列表</Button>
          </div>
          <div className="content">
            <CurrentComponent />
          </div>
        </div>
      </div>
    </FunConfigProvider>
  )
}

export default App
