import React from 'react'
import { Form, InputNumber, Switch, Card } from 'antd'

export interface ScrollConfig {
  x?: number | string
  y?: number | string
  scrollToFirstRowOnChange?: boolean
}

interface TableScrollConfigProps {
  value?: ScrollConfig
  onChange?: (config: ScrollConfig) => void
}

const TableScrollConfig: React.FC<TableScrollConfigProps> = ({ value = {}, onChange }) => {
  const handleChange = (field: keyof ScrollConfig, val: any) => {
    const newConfig = { ...value, [field]: val }
    onChange?.(newConfig)
  }

  return (
    <Card title="滚动配置" size="small">
      <Form layout="vertical" size="small">
        <Form.Item 
          label="水平滚动宽度"
          help="设置表格水平滚动的最小宽度（像素），留空表示自适应"
        >
          <InputNumber
            value={typeof value.x === 'number' ? value.x : undefined}
            onChange={(val) => handleChange('x', val)}
            placeholder="自适应"
            style={{ width: '100%' }}
            min={0}
            addonAfter="px"
          />
        </Form.Item>

        <Form.Item 
          label="垂直滚动高度"
          help="设置表格垂直滚动的最大高度（像素），留空表示不限制"
        >
          <InputNumber
            value={typeof value.y === 'number' ? value.y : undefined}
            onChange={(val) => handleChange('y', val)}
            placeholder="不限制"
            style={{ width: '100%' }}
            min={0}
            addonAfter="px"
          />
        </Form.Item>

        <Form.Item 
          label="切换页面时滚动到顶部"
          help="分页切换时是否自动滚动到表格顶部"
        >
          <Switch
            checked={value.scrollToFirstRowOnChange || false}
            onChange={(checked) => handleChange('scrollToFirstRowOnChange', checked)}
          />
        </Form.Item>
      </Form>
    </Card>
  )
}

export default TableScrollConfig