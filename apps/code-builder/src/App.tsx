import React from 'react'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import CodeBuilderLayout from './components/CodeBuilderLayout'
import './App.css'

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <div className="app">
        <CodeBuilderLayout />
      </div>
    </ConfigProvider>
  )
}

export default App
