import React from 'react'
import { Card, Empty, Alert, Button, Space, Typography, Tooltip, message } from 'antd'
import {
  EyeOutlined,
  BugOutlined,
  ReloadOutlined,
  FullscreenOutlined,
  MobileOutlined,
  DesktopOutlined,
  TabletOutlined,
  PlusOutlined
} from '@ant-design/icons'
import useCodeBuilderStore from '../store'
import type { ComponentConfig } from '../types'
import ComponentRenderer from './ComponentRenderer'

const { Title } = Typography

interface ComponentPreviewProps {}

const ComponentPreview: React.FC<ComponentPreviewProps> = () => {
  const {
    components,
    componentSelector,
    selectComponent,
    globalConfig,
    updateCode,
    astParser,
    editorState
  } = useCodeBuilderStore()

  const [viewMode, setViewMode] = React.useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [renderError, setRenderError] = React.useState<string | null>(null)
  const [isDragOver, setIsDragOver] = React.useState(false)

  // 获取预览容器尺寸
  const getPreviewSize = () => {
    switch (viewMode) {
      case 'mobile':
        return { width: 375, height: 667 }
      case 'tablet':
        return { width: 768, height: 1024 }
      case 'desktop':
      default:
        return { width: '100%', height: '100%' }
    }
  }

  // 拖拽处理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    try {
      const componentData = e.dataTransfer.getData('application/json')
      if (!componentData) return

      const { type, name, props } = JSON.parse(componentData)
      
      // console.log('拖拽的组件:', { type, name, props })
      
      // 生成新组件的代码
      const componentCode = generateComponentCode(type, props)
      // console.log('生成的组件代码:', componentCode)
      
      // 获取当前代码
      const currentCode = editorState.code
      // console.log('当前代码:', currentCode)
      
      // 插入新组件代码
      const newCode = insertComponentIntoCode(currentCode, componentCode)
      // console.log('新代码:', newCode)
      
      // 更新代码
      updateCode(newCode)
      
      message.success(`已添加 ${name} 组件`)
    } catch (error) {
      console.error('Drop component failed:', error)
      message.error('添加组件失败')
    }
  }

  const generateComponentCode = (type: string, props: Record<string, any>): string => {
    const propsString = Object.entries(props)
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `${key}="${value}"`
        } else if (typeof value === 'boolean') {
          return value ? key : ''
        } else {
          return `${key}={${JSON.stringify(value)}}`
        }
      })
      .filter(Boolean)
      .join(' ')

    return `<${type}${propsString ? ' ' + propsString : ''} />`
  }

  const insertComponentIntoCode = (currentCode: string, componentCode: string): string => {
    // console.log('插入组件代码:', { currentCode, componentCode })
    
    // 查找注释位置并替换
    if (currentCode.includes('{/* 在这里开始构建您的页面组件 */}')) {
      const newCode = currentCode.replace(
        '{/* 在这里开始构建您的页面组件 */}',
        `{/* 在这里开始构建您的页面组件 */}
      ${componentCode}`
      )
      // console.log('替换注释后的代码:', newCode)
      return newCode
    }
    
    // 查找div容器并在其中添加组件
    const containerMatch = currentCode.match(/(<div className="page-container">)([\s\S]*?)(<\/div>)/)
    if (containerMatch) {
      const beforeContainer = containerMatch[1]
      const containerContent = containerMatch[2]
      const afterContainer = containerMatch[3]
      
      let newContent = containerContent
      if (containerContent.trim() === '{/* 在这里开始构建您的页面组件 */}') {
        newContent = `${containerContent}
      ${componentCode}`
      } else {
        newContent = `${containerContent}
      ${componentCode}`
      }
      
      const result = currentCode.replace(
        containerMatch[0],
        `${beforeContainer}${newContent}
    ${afterContainer}`
      )
      
      // console.log('容器替换后的代码:', result)
      return result
    }
    
    // console.log('未找到合适的插入位置，返回原代码')
    return currentCode
  }

  // 渲染组件树
  const renderComponentTree = (components: ComponentConfig[]): React.ReactNode => {
    if (components.length === 0) {
      return (
        <Empty
          image={isDragOver ? 
            <PlusOutlined style={{ fontSize: 48, color: '#1890ff' }} /> :
            <EyeOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
          }
          description={isDragOver ? "释放以添加组件" : "暂无组件"}
          style={{ padding: '60px 20px' }}
        >
          <div style={{ color: '#666', fontSize: '14px' }}>
            {isDragOver ? 
              "将组件拖拽到这里" :
              "从左侧拖拽组件到此处或使用AI生成组件"
            }
          </div>
        </Empty>
      )
    }

    try {
      // 不要在这里设置setRenderError，会导致渲染循环
      
      // 找出根组件（没有父组件的组件）
      const rootComponents = components.filter(comp => !comp.identity.parentId)

      if (rootComponents.length === 0) {
        // 如果没有根组件，直接渲染所有组件
        return (
          <div className="component-preview-container" style={{ padding: '16px' }}>
            {components.map(component => (
              <div key={component.identity.id} style={{ marginBottom: '16px' }}>
                <ComponentRenderer
                  component={component}
                  allComponents={components}
                  selectedId={componentSelector.selectedId}
                  onSelect={selectComponent}
                  globalConfig={globalConfig}
                />
              </div>
            ))}
          </div>
        )
      }

      return (
        <div className="component-preview-container" style={{ padding: '16px' }}>
          {rootComponents.map(component => (
            <div key={component.identity.id} style={{ marginBottom: '16px' }}>
              <ComponentRenderer
                component={component}
                allComponents={components}
                selectedId={componentSelector.selectedId}
                onSelect={selectComponent}
                globalConfig={globalConfig}
              />
            </div>
          ))}
        </div>
      )
    } catch (error) {
      console.error('渲染组件树失败:', error)
      // 直接返回错误UI，不设置状态避免渲染循环
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ color: '#ff4d4f', marginBottom: '8px' }}>组件渲染失败</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {error instanceof Error ? error.message : '未知错误'}
          </div>
        </div>
      )
    }
  }

  const previewSize = getPreviewSize()

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 预览工具栏 */}
      <Card
        size="small"
        style={{
          borderRadius: 0,
          borderBottom: '1px solid #e8e8e8',
          marginBottom: 0
        }}
        bodyStyle={{ padding: '8px 16px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={5} style={{ margin: 0 }}>
              组件预览
            </Title>
            <div style={{ fontSize: '12px', color: '#666', marginTop: 2 }}>
              实时预览页面效果 • {components.length} 个组件
            </div>
          </div>

          <Space>
            {/* 设备视图切换 */}
            <Space.Compact>
              <Tooltip title="桌面视图">
                <Button
                  size="small"
                  type={viewMode === 'desktop' ? 'primary' : 'default'}
                  icon={<DesktopOutlined />}
                  onClick={() => setViewMode('desktop')}
                />
              </Tooltip>
              <Tooltip title="平板视图">
                <Button
                  size="small"
                  type={viewMode === 'tablet' ? 'primary' : 'default'}
                  icon={<TabletOutlined />}
                  onClick={() => setViewMode('tablet')}
                />
              </Tooltip>
              <Tooltip title="手机视图">
                <Button
                  size="small"
                  type={viewMode === 'mobile' ? 'primary' : 'default'}
                  icon={<MobileOutlined />}
                  onClick={() => setViewMode('mobile')}
                />
              </Tooltip>
            </Space.Compact>

            <Tooltip title="刷新预览">
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={() => {
                  setRenderError(null)
                  // 强制重新渲染
                  window.location.reload()
                }}
              />
            </Tooltip>

            <Tooltip title="全屏预览">
              <Button
                size="small"
                icon={<FullscreenOutlined />}
                onClick={() => setIsFullscreen(!isFullscreen)}
              />
            </Tooltip>

            {renderError && (
              <Tooltip title="查看错误详情">
                <Button
                  size="small"
                  danger
                  icon={<BugOutlined />}
                  onClick={() => {
                    console.error('渲染错误:', renderError)
                  }}
                />
              </Tooltip>
            )}
          </Space>
        </div>
      </Card>

      {/* 预览内容区域 */}
      <div style={{
        flex: 1,
        background: '#f5f5f5',
        display: 'flex',
        justifyContent: 'center',
        alignItems: viewMode === 'desktop' ? 'stretch' : 'center',
        padding: viewMode === 'desktop' ? 0 : 20,
        overflow: 'auto'
      }}>
        {renderError ? (
          // 错误提示
          <div style={{
            maxWidth: 500,
            width: '100%',
            margin: '40px auto'
          }}>
            <Alert
              message="组件渲染失败"
              description={
                <div>
                  <div style={{ marginBottom: 8 }}>
                    {renderError}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    请检查代码语法或组件配置是否正确
                  </div>
                </div>
              }
              type="error"
              showIcon
              action={
                <Button
                  size="small"
                  danger
                  onClick={() => setRenderError(null)}
                >
                  重试
                </Button>
              }
            />
          </div>
        ) : (
          // 预览容器
          <div
            style={{
              width: previewSize.width,
              height: previewSize.height,
              background: 'white',
              borderRadius: viewMode === 'desktop' ? 0 : 8,
              boxShadow: viewMode === 'desktop' ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.15)',
              overflow: 'auto',
              position: 'relative',
              border: isDragOver ? '2px dashed #1890ff' : (viewMode === 'desktop' ? 'none' : '1px solid #e8e8e8'),
              transition: 'all 0.2s'
            }}
            className="preview-viewport"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* 预览内容 */}
            <div style={{
              padding: 20,
              minHeight: viewMode === 'desktop' ? 'calc(100vh - 200px)' : 'auto',
              background: isDragOver ? 'rgba(24, 144, 255, 0.05)' : 'transparent',
              transition: 'background 0.2s'
            }}>
              {renderComponentTree(components)}
            </div>

            {/* 选中组件高亮边框 */}
            {componentSelector.selectedId && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  border: '2px solid #1890ff',
                  borderRadius: 4,
                  pointerEvents: 'none',
                  zIndex: 1000
                }}
              />
            )}

            {/* 设备标识 */}
            {viewMode !== 'desktop' && (
              <div style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: 4,
                fontSize: '12px',
                pointerEvents: 'none'
              }}>
                {viewMode === 'mobile' ? '手机' : '平板'} ({previewSize.width} × {previewSize.height})
              </div>
            )}
          </div>
        )}
      </div>

      {/* 预览信息栏 */}
      {!renderError && (
        <div style={{
          padding: '8px 16px',
          background: '#fafafa',
          borderTop: '1px solid #e8e8e8',
          fontSize: '12px',
          color: '#666',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <div>
            视图模式: {viewMode === 'desktop' ? '桌面' : viewMode === 'tablet' ? '平板' : '手机'}
            {viewMode !== 'desktop' && ` (${previewSize.width} × ${previewSize.height})`}
          </div>
          <div>
            {componentSelector.selectedId ?
              `已选中: ${components.find(c => c.identity.id === componentSelector.selectedId)?.identity.name}` :
              '未选中组件'
            }
          </div>
        </div>
      )}
    </div>
  )
}

export default ComponentPreview
