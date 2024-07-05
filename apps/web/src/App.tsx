import { useMemo } from 'react'
import { FunConfigProvider } from '@fundam/antd'
import { message } from 'antd'
import { createAPI } from '@fundam/utils'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// import '@fundam/antd/dist/style.css'
import './app.css'
// import Routes from './Routes';
import BaseHeader from './examples/components/BaseHeader'
import ListPro from './examples/list_pro'
import ListProTwo from './examples/list_pro2'
import BaseForm from './examples/form_page/BaseForm'
import ListBasePage from './examples/list_base_page'
import List from './examples/list_page/List'

// 模拟不同环境不同baseURL
const getBaseURL = () => {
  if (window.location.host.includes('.test.')) return '//localhost:5800'
  return '//localhost:5800'
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
    <BrowserRouter>
      <FunConfigProvider
        request={request}
      >
        <div className="app-container">
          <div className="menus">模拟菜单占位</div>
          <div className="main-content">
            <BaseHeader />
            <div className="content">
              <Routes>
                <Route path="/list_pro_2" element={<ListProTwo />}></Route>
                <Route path="/list_pro" element={<ListPro />}></Route>
                <Route path="/list" element={<List />}></Route>
                <Route path="/base_form" element={<BaseForm />}></Route>
                <Route path="/list_base_page" element={<ListBasePage />}></Route>
              </Routes>
            </div>
          </div>
        </div>
      </FunConfigProvider>
    </BrowserRouter>
  )
}

export default App
