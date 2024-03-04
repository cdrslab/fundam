import List from './examples/list_page/List';

import './app.css'
import { FunConfigProvider } from '@fundam/antd/components/FunConfigProvider';

// 模拟不同环境不同baseURL
const getBaseURL = () => {
  if (window.location.host.includes('.test.')) return '//localhost:5174'
  return '//localhost:5174'
}

function App() {
  return (
    <FunConfigProvider
      api={{
        baseURL: getBaseURL
      }}
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
