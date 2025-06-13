import React, { useState, useEffect, useMemo } from 'react'
import { Card, Alert, Spin, Button, Space } from 'antd'
import { StopOutlined, ReloadOutlined } from '@ant-design/icons'
import * as antd from 'antd'
import * as fundamAntd from '@fundam/antd'

interface CodeRendererProps {
  code: string
  visible: boolean
  onClose: () => void
}

const CodeRenderer: React.FC<CodeRendererProps> = ({ code, visible, onClose }) => {
  const [error, setError] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [Component, setComponent] = useState<React.ComponentType | null>(null)

  // 安全的代码执行环境
  const executeCode = useMemo(() => {
    if (!code.trim()) return null

    try {
      // 更彻底地清理代码，移除所有import语句和export语句
      let cleanCode = code
        .replace(/import\s+.*?from\s+['"][^'"]*['"];?\n?/g, '') // 移除所有import
        .replace(/import\s+\{[^}]*\}\s+from\s+['"][^'"]*['"];?\n?/g, '') // 移除解构import
        .replace(/export\s+default\s+\w+;?\s*$/gm, '') // 移除export default
        .replace(/export\s+{[^}]*};?\s*$/gm, '') // 移除export {}
        .replace(/interface\s+\w+\s*{[^}]*}/gs, '') // 移除interface定义
        .replace(/type\s+\w+\s*=\s*[^;]+;?/g, '') // 移除type定义
        // 移除TypeScript类型注解
        .replace(/:\s*React\.FC\b/g, '') // 移除React.FC类型
        .replace(/:\s*React\.Component\b/g, '') // 移除React.Component类型
        .replace(/:\s*Record<[^>]*>/g, '') // 移除Record类型
        .replace(/:\s*[A-Z]\w*<[^>]*>/g, '') // 移除泛型类型
        .replace(/:\s*\w+\[\]/g, '') // 移除数组类型
        .replace(/:\s*\w+\s*\|[^=,;}\n]*/g, '') // 移除联合类型
        .replace(/:\s*any/g, '') // 移除any类型
        .replace(/:\s*string/g, '') // 移除string类型
        .replace(/:\s*number/g, '') // 移除number类型
        .replace(/:\s*boolean/g, '') // 移除boolean类型
        .replace(/:\s*object/g, '') // 移除object类型
        .replace(/:\s*void/g, '') // 移除void类型
        .replace(/:\s*null/g, '') // 移除null类型
        .replace(/:\s*undefined/g, '') // 移除undefined类型
        // 特殊处理常见的问题模式 - 移除不完整的const声明
        .replace(/const\s+(\w+)\s*:\s*[^=]+$/gm, '') // 移除不完整的const声明
        .replace(/const\s+(\w+)\s*:\s*[^=\n]*\n/gm, '') // 移除跨行的不完整const声明
        // 清理空行和多余的空白
        .replace(/\n\s*\n\s*\n/g, '\n\n') // 移除多余的空行
        .replace(/^\s*\n/gm, '') // 移除空行
        .trim()

      // 调试：输出清理后的代码
      console.log('清理后的代码:', cleanCode);
      
      // 额外的逐行清理 - 移除有问题的代码行
      cleanCode = cleanCode
        .split('\n')
        .filter(line => {
          const trimmed = line.trim();
          // 过滤掉不完整的const行
          if (trimmed.startsWith('const ') && !trimmed.includes('=') && !trimmed.includes('{')) {
            console.log('移除问题行:', trimmed);
            return false;
          }
          // 过滤掉只有类型注解的行
          if (trimmed.match(/^\w+\s*:\s*[^=]+$/)) {
            console.log('移除类型注解行:', trimmed);
            return false;
          }
          // 过滤掉空的或只有类型的行
          if (!trimmed || trimmed.match(/^[a-zA-Z]\w*\s*:\s*[^=]*$/)) {
            return false;
          }
          return true;
        })
        .join('\n');
        
      console.log('额外清理后的代码:', cleanCode);
      
      // 查找组件名（可能是GeneratedPage, UserManagementPage等）
      const componentNameMatch = cleanCode.match(/const\s+(\w+)\s*:\s*React\.FC/) || 
                                 cleanCode.match(/const\s+(\w+)\s*=\s*\(\s*\)\s*=>/);
      const componentName = componentNameMatch ? componentNameMatch[1] : 'GeneratedPage';
      
      // 强制将组件名统一为GeneratedPage，避免命名问题
      const normalizedCode = cleanCode.replace(
        new RegExp(`const\\s+${componentName}`, 'g'), 
        'const GeneratedPage'
      );

      // 创建可执行的函数，提供Fundam和antd组件
      const componentFunction = new Function(
        'React', 
        'antd',
        'fundamAntd',
        `
        const { useState, useEffect, useCallback, useMemo } = React;
        
        // Fundam组件 (优先使用)
        const { 
          Form: FundamForm, 
          Card: FundamCard,
          Space: FundamSpace,
          Table: FundamTable,
          Tabs: FundamTabs,
          CardTabs,
          Title: FundamTitle,
          Badge: FundamBadge,
          Input: FundamInput,
          ProTable,
          PageListQuery,
          ModalForm,
          ModalView,
          FunIcon,
          FormItem,
          FormItemInput,
          FormItemSelect,
          FormItemTextArea,
          FormItemCheckbox,
          FormItemRadio,
          FormItemDatePickerRangePicker,
          FormItemUploadImage,
          FormItemTable,
          useAntFormInstance,
          useForm: useFundamForm,
          useFun,
          useModal
        } = fundamAntd;
        
        // Antd组件 (Fundam没有时使用)
        const { 
          Button, Input, Select, DatePicker, Checkbox, Radio, Switch,
          Alert, Tag, Divider, Progress, Statistic,
          Collapse, message, Modal, Drawer, Popconfirm,
          notification, Upload, Avatar, List, Spin, Empty,
          Breadcrumb, Menu, Dropdown, Tooltip, Steps, Timeline,
          Rate, Slider, Transfer, Tree, TreeSelect, Cascader,
          Row, Col, Typography
        } = antd;
        
        // 为了兼容，提供一些别名
        const Card = FundamCard;
        const Form = FundamForm;
        const Space = FundamSpace;
        const Table = FundamTable;
        const Tabs = FundamTabs;
        const Title = FundamTitle;
        const Badge = FundamBadge;
        
        const { Text, Paragraph } = Typography;
        
        // 模拟antd icons（为了简化，定义一些常用的）
        const SearchOutlined = () => React.createElement('span', {style: {fontWeight: 'bold'}}, '🔍');
        const PlusOutlined = () => React.createElement('span', {style: {fontWeight: 'bold'}}, '+');
        const EditOutlined = () => React.createElement('span', {style: {fontWeight: 'bold'}}, '✏️');
        const DeleteOutlined = () => React.createElement('span', {style: {fontWeight: 'bold'}}, '🗑️');
        const UserOutlined = () => React.createElement('span', {style: {fontWeight: 'bold'}}, '👤');
        const DownOutlined = () => React.createElement('span', {style: {fontWeight: 'bold'}}, '⬇️');
        const UpOutlined = () => React.createElement('span', {style: {fontWeight: 'bold'}}, '⬆️');
        const LoadingOutlined = () => React.createElement('span', {style: {fontWeight: 'bold'}}, '⏳');
        
        ${normalizedCode}
        
        return GeneratedPage;
        `
      )

      return componentFunction(React, antd, fundamAntd)
    } catch (err) {
      console.error('代码执行错误:', err)
      setError(err instanceof Error ? err.message : '代码执行失败')
      return null
    }
  }, [code])

  useEffect(() => {
    if (executeCode) {
      setComponent(() => executeCode)
      setError(null)
      setIsRunning(true)
    } else {
      setComponent(null)
      setIsRunning(false)
    }
  }, [executeCode])

  const handleReload = () => {
    setError(null)
    setComponent(null)
    setIsRunning(false)
    
    setTimeout(() => {
      if (executeCode) {
        setComponent(() => executeCode)
        setError(null)
        setIsRunning(true)
      }
    }, 100)
  }

  const handleStop = () => {
    setComponent(null)
    setIsRunning(false)
    setError(null)
  }

  if (!visible) return null

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={onClose}
    >
      <Card
        title={
          <Space>
            AI代码预览
            <Space size="small">
              <Button 
                size="small" 
                icon={<ReloadOutlined />} 
                onClick={(e) => {
                  e.stopPropagation()
                  handleReload()
                }}
              >
                重新运行
              </Button>
              <Button 
                size="small" 
                icon={<StopOutlined />} 
                onClick={(e) => {
                  e.stopPropagation()
                  handleStop()
                }}
                disabled={!isRunning}
              >
                停止
              </Button>
              <Button 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation()
                  onClose()
                }}
              >
                关闭
              </Button>
            </Space>
          </Space>
        }
        style={{
          width: '90vw',
          height: '90vh',
          maxWidth: '1200px',
          maxHeight: '800px'
        }}
        styles={{
          body: {
            height: 'calc(100% - 60px)',
            overflow: 'auto',
            padding: '16px'
          }
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {error ? (
          <Alert
            message="代码执行错误"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        ) : null}
        
        {!Component && !error && isRunning && (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>正在渲染代码...</div>
          </div>
        )}
        
        {Component && !error && (
          <div style={{ border: '1px solid #f0f0f0', borderRadius: '6px', padding: '16px' }}>
            <Component />
          </div>
        )}
        
        {!Component && !error && !isRunning && (
          <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
            点击"重新运行"按钮来渲染代码
          </div>
        )}
      </Card>
    </div>
  )
}

export default CodeRenderer