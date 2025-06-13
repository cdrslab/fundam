import React, { useState } from 'react'
import { Button, Form, Input, Select, Switch, Space, Card, Popconfirm, Typography } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'

const { Option } = Select
const { Text } = Typography

export interface FormItemConfig {
  name: string
  label: string
  type: 'input' | 'select' | 'datePicker' | 'rangePicker' | 'textArea'
  placeholder?: string
  required?: boolean
  options?: Array<{ label: string; value: string | number }>
  span?: number
}

interface PageListQueryFormConfigProps {
  value: FormItemConfig[]
  onChange: (formItems: FormItemConfig[]) => void
}

const PageListQueryFormConfig: React.FC<PageListQueryFormConfigProps> = ({
  value = [],
  onChange
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const addFormItem = () => {
    const newItem: FormItemConfig = {
      name: `field_${Date.now()}`,
      label: '新字段',
      type: 'input',
      span: 8
    }
    onChange([...value, newItem])
    setEditingIndex(value.length)
  }

  const updateFormItem = (index: number, updatedItem: Partial<FormItemConfig>) => {
    const newItems = [...value]
    newItems[index] = { ...newItems[index], ...updatedItem }
    onChange(newItems)
  }

  const deleteFormItem = (index: number) => {
    const newItems = value.filter((_, i) => i !== index)
    onChange(newItems)
    if (editingIndex === index) {
      setEditingIndex(null)
    }
  }

  const moveFormItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...value]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    if (targetIndex >= 0 && targetIndex < newItems.length) {
      [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]]
      onChange(newItems)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button 
          type="dashed" 
          onClick={addFormItem} 
          icon={<PlusOutlined />}
          block
        >
          添加查询字段
        </Button>
      </div>

      <Space direction="vertical" style={{ width: '100%' }} size="small">
        {value.map((item, index) => (
          <Card
            key={index}
            size="small"
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>{item.label}</Text>
                <Space>
                  <Button
                    size="small"
                    onClick={() => moveFormItem(index, 'up')}
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    size="small"
                    onClick={() => moveFormItem(index, 'down')}
                    disabled={index === value.length - 1}
                  >
                    ↓
                  </Button>
                  <Button
                    size="small"
                    type={editingIndex === index ? 'primary' : 'default'}
                    onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                  >
                    {editingIndex === index ? '收起' : '编辑'}
                  </Button>
                  <Popconfirm
                    title="确定删除这个字段吗？"
                    onConfirm={() => deleteFormItem(index)}
                  >
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              </div>
            }
          >
            {editingIndex === index ? (
              <Form layout="vertical" size="small">
                <Form.Item label="字段名称">
                  <Input
                    value={item.name}
                    onChange={(e) => updateFormItem(index, { name: e.target.value })}
                    placeholder="请输入字段名称"
                  />
                </Form.Item>

                <Form.Item label="显示标签">
                  <Input
                    value={item.label}
                    onChange={(e) => updateFormItem(index, { label: e.target.value })}
                    placeholder="请输入显示标签"
                  />
                </Form.Item>

                <Form.Item label="组件类型">
                  <Select
                    value={item.type}
                    onChange={(type) => updateFormItem(index, { type })}
                  >
                    <Option value="input">输入框</Option>
                    <Option value="select">选择器</Option>
                    <Option value="datePicker">日期选择</Option>
                    <Option value="rangePicker">日期范围</Option>
                    <Option value="textArea">多行输入</Option>
                  </Select>
                </Form.Item>

                <Form.Item label="占位符">
                  <Input
                    value={item.placeholder}
                    onChange={(e) => updateFormItem(index, { placeholder: e.target.value })}
                    placeholder="请输入占位符"
                  />
                </Form.Item>

                <Form.Item label="栅格宽度">
                  <Select
                    value={item.span || 8}
                    onChange={(span) => updateFormItem(index, { span })}
                  >
                    <Option value={6}>1/4 宽度</Option>
                    <Option value={8}>1/3 宽度</Option>
                    <Option value={12}>1/2 宽度</Option>
                    <Option value={24}>全宽度</Option>
                  </Select>
                </Form.Item>

                {item.type === 'select' && (
                  <Form.Item label="选项配置">
                    <Input.TextArea
                      value={JSON.stringify(item.options || [], null, 2)}
                      onChange={(e) => {
                        try {
                          const options = JSON.parse(e.target.value)
                          updateFormItem(index, { options })
                        } catch (error) {
                          // 忽略JSON解析错误
                        }
                      }}
                      placeholder='[{"label":"选项1","value":"value1"}]'
                      rows={3}
                    />
                  </Form.Item>
                )}

                <Form.Item label="必填项">
                  <Switch
                    checked={item.required || false}
                    onChange={(required) => updateFormItem(index, { required })}
                  />
                </Form.Item>
              </Form>
            ) : (
              <div>
                <Text type="secondary">
                  字段: {item.name} | 类型: {item.type} | 宽度: {item.span || 8}/24
                  {item.required && ' | 必填'}
                </Text>
              </div>
            )}
          </Card>
        ))}
      </Space>

      {value.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 0', 
          color: '#999',
          border: '1px dashed #d9d9d9',
          borderRadius: '4px'
        }}>
          暂无查询字段，点击上方按钮添加
        </div>
      )}
    </div>
  )
}

export default PageListQueryFormConfig