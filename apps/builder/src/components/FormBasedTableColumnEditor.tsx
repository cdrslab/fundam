import React, { useState } from 'react'
import { Button, Form, Input, Select, Switch, Space, Card, Popconfirm, Typography } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'

const { Option } = Select
const { Text } = Typography

export interface TableColumn {
  key: string
  dataIndex: string
  title: string
  width?: number
  align?: 'left' | 'center' | 'right'
  render?: string
  sorter?: boolean
  fixed?: 'left' | 'right'
  ellipsis?: boolean
}

interface FormBasedTableColumnEditorProps {
  columns: TableColumn[]
  onChange: (columns: TableColumn[]) => void
}

const FormBasedTableColumnEditor: React.FC<FormBasedTableColumnEditorProps> = ({
  columns,
  onChange
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const addColumn = () => {
    const newColumn: TableColumn = {
      key: `col_${Date.now()}`,
      dataIndex: '',
      title: '新列',
      align: 'left'
    }
    onChange([...columns, newColumn])
    setEditingIndex(columns.length)
  }

  const updateColumn = (index: number, updatedColumn: Partial<TableColumn>) => {
    const newColumns = [...columns]
    newColumns[index] = { ...newColumns[index], ...updatedColumn }
    onChange(newColumns)
  }

  const deleteColumn = (index: number) => {
    const newColumns = columns.filter((_, i) => i !== index)
    onChange(newColumns)
    if (editingIndex === index) {
      setEditingIndex(null)
    }
  }

  const moveColumn = (index: number, direction: 'up' | 'down') => {
    const newColumns = [...columns]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    if (targetIndex >= 0 && targetIndex < newColumns.length) {
      [newColumns[index], newColumns[targetIndex]] = [newColumns[targetIndex], newColumns[index]]
      onChange(newColumns)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button 
          type="dashed" 
          onClick={addColumn} 
          icon={<PlusOutlined />}
          block
        >
          添加列
        </Button>
      </div>

      <Space direction="vertical" style={{ width: '100%' }} size="small">
        {columns.map((column, index) => (
          <Card
            key={column.key}
            size="small"
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>{column.title || '未命名列'}</Text>
                <Space>
                  <Button
                    size="small"
                    onClick={() => moveColumn(index, 'up')}
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    size="small"
                    onClick={() => moveColumn(index, 'down')}
                    disabled={index === columns.length - 1}
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
                    title="确定删除这一列吗？"
                    onConfirm={() => deleteColumn(index)}
                  >
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              </div>
            }
          >
            {editingIndex === index ? (
              <Form layout="vertical" size="small">
                <Form.Item label="列标题">
                  <Input
                    value={column.title}
                    onChange={(e) => updateColumn(index, { title: e.target.value })}
                    placeholder="请输入列标题"
                  />
                </Form.Item>

                <Form.Item label="数据字段">
                  <Input
                    value={column.dataIndex}
                    onChange={(e) => updateColumn(index, { dataIndex: e.target.value })}
                    placeholder="请输入数据字段名"
                  />
                </Form.Item>

                <Form.Item label="列宽度">
                  <Input
                    type="number"
                    value={column.width}
                    onChange={(e) => updateColumn(index, { width: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="自动"
                    addonAfter="px"
                  />
                </Form.Item>

                <Form.Item label="对齐方式">
                  <Select
                    value={column.align || 'left'}
                    onChange={(align) => updateColumn(index, { align })}
                  >
                    <Option value="left">左对齐</Option>
                    <Option value="center">居中</Option>
                    <Option value="right">右对齐</Option>
                  </Select>
                </Form.Item>

                <Form.Item label="渲染类型">
                  <Select
                    value={column.render || 'text'}
                    onChange={(render) => updateColumn(index, { render: render === 'text' ? undefined : render })}
                    placeholder="默认文本"
                  >
                    <Option value="text">默认文本</Option>
                    <Option value="actions">操作按钮</Option>
                    <Option value="tag">标签</Option>
                    <Option value="link">链接</Option>
                    <Option value="image">图片</Option>
                  </Select>
                </Form.Item>

                <Form.Item label="固定列">
                  <Select
                    value={column.fixed || 'none'}
                    onChange={(fixed) => updateColumn(index, { fixed: fixed === 'none' ? undefined : fixed })}
                  >
                    <Option value="none">不固定</Option>
                    <Option value="left">固定左侧</Option>
                    <Option value="right">固定右侧</Option>
                  </Select>
                </Form.Item>

                <Space>
                  <Form.Item label="可排序" style={{ marginBottom: 0 }}>
                    <Switch
                      checked={column.sorter || false}
                      onChange={(sorter) => updateColumn(index, { sorter })}
                    />
                  </Form.Item>

                  <Form.Item label="超出省略" style={{ marginBottom: 0 }}>
                    <Switch
                      checked={column.ellipsis || false}
                      onChange={(ellipsis) => updateColumn(index, { ellipsis })}
                    />
                  </Form.Item>
                </Space>
              </Form>
            ) : (
              <div>
                <Text type="secondary">
                  字段: {column.dataIndex || '未设置'} | 
                  宽度: {column.width || '自动'} | 
                  对齐: {column.align || '左对齐'}
                  {column.sorter && ' | 可排序'}
                  {column.ellipsis && ' | 省略显示'}
                </Text>
              </div>
            )}
          </Card>
        ))}
      </Space>

      {columns.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 0', 
          color: '#999',
          border: '1px dashed #d9d9d9',
          borderRadius: '4px'
        }}>
          暂无列配置，点击上方按钮添加
        </div>
      )}
    </div>
  )
}

export default FormBasedTableColumnEditor