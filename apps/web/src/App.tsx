import List from './examples/list_page/List';

import './app.css'

function App() {
  return (
    <div className="app-container">
      <div className="menus">模拟菜单占位</div>
      <div className="main-content">
        <div className="top-bar">模拟导航条占位</div>
        <div className="content">
          <List/>
        </div>
      </div>
    </div>
  )
}

export default App
