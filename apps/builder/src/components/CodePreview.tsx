import React, { useState, useMemo } from 'react'
import { Modal, Tabs, Button, message, Typography } from 'antd'
import type { TabsProps } from 'antd'
import { CopyOutlined, DownloadOutlined } from '@ant-design/icons'
import Editor from '@monaco-editor/react'

import type { ComponentConfig } from '../types'
import { generateFullPageCode } from '../utils/codeGenerator'

const { Text } = Typography

interface CodePreviewProps {
  components: ComponentConfig[]
  visible: boolean
  onClose: () => void
}

const CodePreview: React.FC<CodePreviewProps> = ({
  components,
  visible,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('tsx')

  // 生成代码
  const generatedCode = useMemo(() => {
    return generateFullPageCode(components)
  }, [components])

  // 生成配置JSON
  const configJson = useMemo(() => {
    return JSON.stringify(
      {
        version: '1.0.0',
        components: components.map(comp => ({
          id: comp.id,
          type: comp.type,
          props: comp.props
        }))
      },
      null,
      2
    )
  }, [components])

  // 复制到剪贴板
  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      message.success('代码已复制到剪贴板')
    } catch (error) {
      message.error('复制失败，请手动复制')
    }
  }

  // 下载文件
  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    message.success(`${filename} 下载成功`)
  }

  const getCurrentContent = () => {
    return activeTab === 'tsx' ? generatedCode : configJson
  }

  const getCurrentFilename = () => {
    return activeTab === 'tsx' ? 'Page.tsx' : 'page-config.json'
  }

  // 为Tabs组件生成items
  const tabItems: TabsProps['items'] = [
    {
      key: 'tsx',
      label: 'TSX代码',
      children: (
        <>
          <div style={{ marginBottom: '8px' }}>
            <Text type="secondary">
              生成的React组件代码，可直接在项目中使用
            </Text>
          </div>
          <div style={{ border: '1px solid #d9d9d9', borderRadius: '6px' }}>
            <Editor
              height="500px"
              language="typescript"
              value={generatedCode}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                theme: 'vs-light'
              }}
            />
          </div>
        </>
      )
    },
    {
      key: 'json',
      label: '配置JSON',
      children: (
        <>
          <div style={{ marginBottom: '8px' }}>
            <Text type="secondary">
              页面配置数据，可用于保存和恢复页面设计
            </Text>
          </div>
          <div style={{ border: '1px solid #d9d9d9', borderRadius: '6px' }}>
            <Editor
              height="500px"
              language="json"
              value={configJson}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                theme: 'vs-light'
              }}
            />
          </div>
        </>
      )
    }
  ]

  return (
    <Modal
      title="代码预览"
      open={visible}
      onCancel={onClose}
      width={1000}
      style={{ top: 20 }}
      footer={[
        <Button
          key="copy"
          icon={<CopyOutlined />}
          onClick={() => handleCopy(getCurrentContent())}
        >
          复制代码
        </Button>,
        <Button
          key="download"
          icon={<DownloadOutlined />}
          onClick={() => handleDownload(getCurrentContent(), getCurrentFilename())}
        >
          下载文件
        </Button>,
        <Button key="close" onClick={onClose}>
          关闭
        </Button>
      ]}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
      />
    </Modal>
  )
}

export default CodePreview
