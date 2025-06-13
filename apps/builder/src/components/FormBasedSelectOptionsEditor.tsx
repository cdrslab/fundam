import React, { useState } from 'react'
import { Button, Form, Input, Space, Card, Popconfirm, Typography } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'

const { Text } = Typography

export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

interface FormBasedSelectOptionsEditorProps {
  options: SelectOption[]
  onChange: (options: SelectOption[]) => void
}

const FormBasedSelectOptionsEditor: React.FC<FormBasedSelectOptionsEditorProps> = ({
  options,
  onChange
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const addOption = () => {
    const newOption: SelectOption = {
      label: '新选项',
      value: `option_${Date.now()}`
    }
    onChange([...options, newOption])
    setEditingIndex(options.length)
  }

  const updateOption = (index: number, updatedOption: Partial<SelectOption>) => {
    const newOptions = [...options]
    newOptions[index] = { ...newOptions[index], ...updatedOption }
    onChange(newOptions)
  }

  const deleteOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index)
    onChange(newOptions)
    if (editingIndex === index) {
      setEditingIndex(null)
    }
  }

  const moveOption = (index: number, direction: 'up' | 'down') => {
    const newOptions = [...options]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    if (targetIndex >= 0 && targetIndex < newOptions.length) {
      [newOptions[index], newOptions[targetIndex]] = [newOptions[targetIndex], newOptions[index]]
      onChange(newOptions)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button 
          type="dashed" 
          onClick={addOption} 
          icon={<PlusOutlined />}
          block
        >
          添加选项
        </Button>
      </div>

      <Space direction="vertical" style={{ width: '100%' }} size="small">
        {options.map((option, index) => (
          <Card
            key={index}
            size="small"
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>{option.label || '未命名选项'}</Text>
                <Space>
                  <Button
                    size="small"
                    onClick={() => moveOption(index, 'up')}
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    size="small"
                    onClick={() => moveOption(index, 'down')}
                    disabled={index === options.length - 1}
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
                    title="确定删除这个选项吗？"
                    onConfirm={() => deleteOption(index)}
                  >
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              </div>
            }
          >
            {editingIndex === index ? (
              <Form layout="vertical" size="small">
                <Form.Item label="选项标签">
                  <Input
                    value={option.label}
                    onChange={(e) => updateOption(index, { label: e.target.value })}
                    placeholder="请输入选项标签"
                  />
                </Form.Item>

                <Form.Item label="选项值">
                  <Input
                    value={option.value}
                    onChange={(e) => updateOption(index, { value: e.target.value })}
                    placeholder="请输入选项值"
                  />
                </Form.Item>
              </Form>
            ) : (
              <div>
                <Text type="secondary">
                  值: {option.value}
                  {option.disabled && ' (已禁用)'}
                </Text>
              </div>
            )}
          </Card>
        ))}
      </Space>

      {options.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 0', 
          color: '#999',
          border: '1px dashed #d9d9d9',
          borderRadius: '4px'
        }}>
          暂无选项配置，点击上方按钮添加
        </div>
      )}
    </div>
  )
}

export default FormBasedSelectOptionsEditor