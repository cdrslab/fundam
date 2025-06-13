import React, { useState } from 'react'
import { 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Switch, 
  Select, 
  Button, 
  Space,
  Table,
  Popconfirm
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'

interface TableColumn {
  title: string
  dataIndex: string
  key: string
  width?: number
  sorter?: boolean
  filters?: Array<{ text: string; value: any }>
  render?: string
  align?: 'left' | 'center' | 'right'
  fixed?: 'left' | 'right'
}

interface TableColumnEditorProps {
  columns: TableColumn[]
  onChange: (columns: TableColumn[]) => void
}

const TableColumnEditor: React.FC<TableColumnEditorProps> = ({ 
  columns, 
  onChange 
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingColumn, setEditingColumn] = useState<TableColumn | null>(null)
  const [form] = Form.useForm()

  const handleAdd = () => {
    setEditingColumn(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEdit = (column: TableColumn) => {
    setEditingColumn(column)
    form.setFieldsValue(column)
    setIsModalVisible(true)
  }

  const handleDelete = (index: number) => {
    const newColumns = [...columns]
    newColumns.splice(index, 1)
    onChange(newColumns)
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      const newColumns = [...columns]
      
      if (editingColumn) {
        const index = columns.findIndex(col => col.key === editingColumn.key)
        newColumns[index] = { ...values, key: values.key || values.dataIndex }
      } else {
        newColumns.push({ ...values, key: values.key || values.dataIndex })
      }
      
      onChange(newColumns)
      setIsModalVisible(false)
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  const tableColumns = [
    { title: '列标题', dataIndex: 'title', key: 'title' },
    { title: '数据字段', dataIndex: 'dataIndex', key: 'dataIndex' },
    { title: '宽度', dataIndex: 'width', key: 'width' },
    { title: '排序', dataIndex: 'sorter', key: 'sorter', render: (val: boolean) => val ? '是' : '否' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: TableColumn, index: number) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="确定删除这一列吗？"
            onConfirm={() => handleDelete(index)}
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          size="small"
        >
          添加列
        </Button>
      </div>

      <Table
        columns={tableColumns}
        dataSource={columns}
        pagination={false}
        size="small"
        scroll={{ x: 400 }}
      />

      <Modal
        title={editingColumn ? '编辑列' : '添加列'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="title"
            label="列标题"
            rules={[{ required: true, message: '请输入列标题' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="dataIndex"
            label="数据字段"
            rules={[{ required: true, message: '请输入数据字段' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="width" label="列宽度">
            <InputNumber style={{ width: '100%' }} min={50} />
          </Form.Item>

          <Form.Item name="align" label="对齐方式">
            <Select allowClear>
              <Select.Option value="left">左对齐</Select.Option>
              <Select.Option value="center">居中</Select.Option>
              <Select.Option value="right">右对齐</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="fixed" label="固定列">
            <Select allowClear>
              <Select.Option value="left">固定在左侧</Select.Option>
              <Select.Option value="right">固定在右侧</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="sorter" label="支持排序" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="render" label="渲染类型">
            <Select allowClear>
              <Select.Option value="text">普通文本</Select.Option>
              <Select.Option value="actions">操作按钮</Select.Option>
              <Select.Option value="status">状态标签</Select.Option>
              <Select.Option value="date">日期格式</Select.Option>
              <Select.Option value="number">数字格式</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TableColumnEditor