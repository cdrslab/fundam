import React from 'react'
import { Layout, Typography, Space, Button, Tooltip } from 'antd'
import { 
  CodeOutlined, 
  EyeOutlined, 
  SaveOutlined, 
  SettingOutlined,
  BugOutlined,
  PlayCircleOutlined
} from '@ant-design/icons'
import ComponentTree from './ComponentTree'
import CodeEditor from './CodeEditor'
import ComponentPreview from './ComponentPreview'
import PropertiesPanel from './PropertiesPanel'
import AIAssistant from './AIAssistant'
import GlobalConfigPanel from './GlobalConfigPanel'
import useCodeBuilderStore from '../store'

const { Header, Content } = Layout
const { Title } = Typography

const CodeBuilderLayout: React.FC = () => {
  const [configVisible, setConfigVisible] = React.useState(false)
  
  const { 
    editorState, 
    toggleCodeView,
    selectedComponent
  } = useCodeBuilderStore()

  return (
    <Layout className="app">
      {/* 顶部工具栏 */}
      <Header className="layout-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
            Fundam 代码构建器
          </Title>
          <div style={{ fontSize: '12px', color: '#666' }}>
            纯代码驱动的可视化搭建平台
          </div>
        </div>

        <Space>
          <Tooltip title={editorState.isCodeView ? '切换到可视化视图' : '切换到代码视图'}>
            <Button 
              icon={editorState.isCodeView ? <EyeOutlined /> : <CodeOutlined />}
              onClick={toggleCodeView}
            >
              {editorState.isCodeView ? '可视化' : '代码'}
            </Button>
          </Tooltip>
          
          <Tooltip title="运行预览">
            <Button icon={<PlayCircleOutlined />} type="primary">
              运行
            </Button>
          </Tooltip>
          
          <Tooltip title="保存代码">
            <Button 
              icon={<SaveOutlined />} 
              disabled={!editorState.isDirty}
            >
              保存
            </Button>
          </Tooltip>
          
          <Tooltip title="全局配置">
            <Button 
              icon={<SettingOutlined />}
              onClick={() => setConfigVisible(true)}
            >
              配置
            </Button>
          </Tooltip>
          
          <Tooltip title="调试模式">
            <Button icon={<BugOutlined />}>
              调试
            </Button>
          </Tooltip>
        </Space>
      </Header>

      {/* 主体内容区域 */}
      <Content className="layout-content">
        {/* 左侧边栏 - 组件树 */}
        <div className="layout-sidebar">
          <ComponentTree />
        </div>

        {/* 中间主区域 */}
        <div className="layout-main">
          {editorState.isCodeView ? (
            // 代码编辑视图
            <CodeEditor />
          ) : (
            // 可视化预览视图
            <ComponentPreview />
          )}
        </div>

        {/* 右侧属性面板 */}
        <div className="layout-properties">
          {/* 组件属性配置 */}
          <div style={{ flex: 1, borderBottom: '1px solid #e8e8e8' }}>
            <PropertiesPanel selectedComponent={selectedComponent} />
          </div>
          
          {/* AI助手 */}
          <div style={{ height: '400px' }}>
            <AIAssistant selectedComponent={selectedComponent} />
          </div>
        </div>
      </Content>

      {/* 全局配置弹窗 */}
      <GlobalConfigPanel 
        visible={configVisible}
        onClose={() => setConfigVisible(false)}
      />
    </Layout>
  )
}

export default CodeBuilderLayout