import React from 'react'
import { Form, InputNumber, Switch, Select, Card } from 'antd'

const { Option } = Select

export interface PaginationConfig {
  current?: number
  pageSize?: number
  total?: number
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  showTotal?: boolean
  pageSizeOptions?: string[]
  position?: 'topLeft' | 'topCenter' | 'topRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight'[]
  size?: 'default' | 'small'
  simple?: boolean
  hideOnSinglePage?: boolean
}

interface TablePaginationConfigProps {
  value?: PaginationConfig
  onChange?: (config: PaginationConfig) => void
}

const TablePaginationConfig: React.FC<TablePaginationConfigProps> = ({ value = {}, onChange }) => {
  const handleChange = (field: keyof PaginationConfig, val: any) => {
    const newConfig = { ...value, [field]: val }
    onChange?.(newConfig)
  }

  return (
    <Card title="分页配置" size="small">
      <Form layout="vertical" size="small">
        <Form.Item label="每页条数" help="默认每页显示的数据条数">
          <InputNumber
            value={value.pageSize}
            onChange={(val) => handleChange('pageSize', val)}
            placeholder="10"
            style={{ width: '100%' }}
            min={1}
            max={1000}
          />
        </Form.Item>

        <Form.Item label="分页器尺寸">
          <Select
            value={value.size || 'default'}
            onChange={(val) => handleChange('size', val)}
            style={{ width: '100%' }}
          >
            <Option value="default">默认</Option>
            <Option value="small">小尺寸</Option>
          </Select>
        </Form.Item>

        <Form.Item label="分页器位置">
          <Select
            mode="multiple"
            value={value.position || ['bottomRight']}
            onChange={(val) => handleChange('position', val)}
            style={{ width: '100%' }}
            placeholder="选择分页器位置"
          >
            <Option value="topLeft">顶部左对齐</Option>
            <Option value="topCenter">顶部居中</Option>
            <Option value="topRight">顶部右对齐</Option>
            <Option value="bottomLeft">底部左对齐</Option>
            <Option value="bottomCenter">底部居中</Option>
            <Option value="bottomRight">底部右对齐</Option>
          </Select>
        </Form.Item>

        <Form.Item label="每页条数选项" help="用户可选择的每页显示条数">
          <Select
            mode="tags"
            value={value.pageSizeOptions || ['10', '20', '50', '100']}
            onChange={(val) => handleChange('pageSizeOptions', val)}
            style={{ width: '100%' }}
            placeholder="输入数字，回车添加"
          />
        </Form.Item>

        <Form.Item label="显示页数切换器">
          <Switch
            checked={value.showSizeChanger !== false}
            onChange={(checked) => handleChange('showSizeChanger', checked)}
          />
        </Form.Item>

        <Form.Item label="显示快速跳转">
          <Switch
            checked={value.showQuickJumper || false}
            onChange={(checked) => handleChange('showQuickJumper', checked)}
          />
        </Form.Item>

        <Form.Item label="显示总数信息">
          <Switch
            checked={value.showTotal !== false}
            onChange={(checked) => handleChange('showTotal', checked)}
          />
        </Form.Item>

        <Form.Item label="简洁模式">
          <Switch
            checked={value.simple || false}
            onChange={(checked) => handleChange('simple', checked)}
          />
        </Form.Item>

        <Form.Item label="只有一页时隐藏">
          <Switch
            checked={value.hideOnSinglePage || false}
            onChange={(checked) => handleChange('hideOnSinglePage', checked)}
          />
        </Form.Item>
      </Form>
    </Card>
  )
}

export default TablePaginationConfig