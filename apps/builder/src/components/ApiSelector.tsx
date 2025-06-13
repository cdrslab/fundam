import React from 'react'
import { Select, Button, Space, Typography } from 'antd'
import { PlusOutlined, SettingOutlined } from '@ant-design/icons'
import { globalConfigManager } from '../store/globalConfig'

const { Option } = Select
const { Text } = Typography

interface ApiSelectorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  allowClear?: boolean
  onAddNew?: () => void
  onManage?: () => void
}

const ApiSelector: React.FC<ApiSelectorProps> = ({
  value,
  onChange,
  placeholder = "请选择API接口",
  allowClear = true,
  onAddNew,
  onManage
}) => {
  const apis = globalConfigManager.getConfig().apis

  const handleAddNew = () => {
    if (onAddNew) {
      onAddNew()
    } else {
      // 默认行为：打开全局配置
      window.dispatchEvent(new CustomEvent('open-global-config', { detail: { tab: 'apis' } }))
    }
  }

  const handleManage = () => {
    if (onManage) {
      onManage()
    } else {
      // 默认行为：打开全局配置
      window.dispatchEvent(new CustomEvent('open-global-config', { detail: { tab: 'apis' } }))
    }
  }

  return (
    <div>
      <Select
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        allowClear={allowClear}
        style={{ width: '100%' }}
        showSearch
        optionFilterProp="children"
        dropdownRender={(menu) => (
          <div>
            {menu}
            <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Button
                  type="link"
                  icon={<PlusOutlined />}
                  onClick={handleAddNew}
                  size="small"
                >
                  添加API
                </Button>
                <Button
                  type="link"
                  icon={<SettingOutlined />}
                  onClick={handleManage}
                  size="small"
                >
                  管理
                </Button>
              </Space>
            </div>
          </div>
        )}
      >
        {apis.map(api => (
          <Option key={api.id} value={api.id}>
            <div>
              <Text strong>{api.name}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {api.method} {api.url}
              </Text>
            </div>
          </Option>
        ))}
      </Select>
      
      {apis.length === 0 && (
        <div style={{ 
          marginTop: 8, 
          padding: '12px', 
          background: '#fafafa', 
          border: '1px dashed #d9d9d9',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          <Text type="secondary">暂无API配置</Text>
          <Button
            type="link"
            size="small"
            icon={<PlusOutlined />}
            onClick={handleAddNew}
          >
            立即添加
          </Button>
        </div>
      )}
    </div>
  )
}

export default ApiSelector