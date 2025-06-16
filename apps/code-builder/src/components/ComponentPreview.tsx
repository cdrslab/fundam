import React, { useMemo } from 'react'
import { Card, Empty, Alert, Button, Space, Typography, Tooltip } from 'antd'
import {
  EyeOutlined,
  BugOutlined,
  ReloadOutlined,
  FullscreenOutlined,
  MobileOutlined,
  DesktopOutlined,
  TabletOutlined
} from '@ant-design/icons'
import useCodeBuilderStore from '../store'
import type { ComponentConfig } from '../types'
import ComponentRenderer from './ComponentRenderer'

const { Title } = Typography

interface ComponentPreviewProps {}

const ComponentPreview: React.FC<ComponentPreviewProps> = () => {
  const {
    editorState,
    components,
    componentSelector,
    selectComponent,
    globalConfig
  } = useCodeBuilderStore()

  const [viewMode, setViewMode] = React.useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [renderError, setRenderError] = React.useState<string | null>(null)

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

  // 渲染组件树
  const renderComponentTree = (components: ComponentConfig[]): React.ReactNode => {
    if (components.length === 0) {
      return (
        <Empty
          image={<EyeOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />}
          description="暂无组件"
          style={{ padding: '60px 20px' }}
        >
          <div style={{ color: '#666', fontSize: '14px' }}>
            在代码编辑器中编写组件或使用AI生成组件
          </div>
        </Empty>
      )
    }

    try {
      setRenderError(null)

      // 找出根组件（没有父组件的组件）
      const rootComponents = components.filter(comp => !comp.identity.parentId)

      return (
        <div className="component-preview-container">
          {rootComponents.map(component => (
            <ComponentRenderer
              key={component.identity.id}
              component={component}
              allComponents={components}
              selectedId={componentSelector.selectedId}
              onSelect={selectComponent}
              globalConfig={globalConfig}
            />
          ))}
        </div>
      )
    } catch (error) {
      setRenderError(error instanceof Error ? error.message : '渲染失败')
      return null
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
              border: viewMode === 'desktop' ? 'none' : '1px solid #e8e8e8'
            }}
            className="preview-viewport"
          >
            {/* 预览内容 */}
            <div style={{
              padding: 20,
              minHeight: viewMode === 'desktop' ? 'calc(100vh - 200px)' : 'auto'
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
