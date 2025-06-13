import React, { useState } from 'react'
import {
  Form,
  Input,
  Button,
  Space,
  List,
  Card,
  Popconfirm,
  Modal,
  Select
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, DragOutlined } from '@ant-design/icons'

interface TabItem {
  key: string
  label: string
  children?: string
}

interface TabsConfigEditorProps {
  value?: TabItem[]
  onChange?: (value: TabItem[]) => void
}

const TabsConfigEditor: React.FC<TabsConfigEditorProps> = ({
  value = [],
  onChange
}) => {
  const [editingItem, setEditingItem] = useState<TabItem | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    form.setFieldsValue({
      label: `标签页${value.length + 1}`,
      children: '标签页内容'
    })
    setIsModalVisible(true)
  }

  const handleEdit = (item: TabItem) => {
    setEditingItem(item)
    form.setFieldsValue(item)
    setIsModalVisible(true)
  }

  const handleDelete = (key: string) => {
    const newItems = value.filter(item => item.key !== key)
    onChange?.(newItems)
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      const newItem: TabItem = {
        key: editingItem?.key || `tab-${Date.now()}`,
        label: values.label,
        children: values.children
      }

      let newItems
      if (editingItem) {
        newItems = value.map(item => 
          item.key === editingItem.key ? newItem : item
        )
      } else {
        newItems = [...value, newItem]
      }

      onChange?.(newItems)
      setIsModalVisible(false)
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          size="small"
        >
          添加标签页
        </Button>
      </div>

      <List
        size="small"
        dataSource={value}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button
                key="edit"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEdit(item)}
              />,
              <Popconfirm
                key="delete"
                title="确定删除这个标签页吗？"
                onConfirm={() => handleDelete(item.key)}
              >
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            ]}
          >
            <List.Item.Meta
              title={item.label}
              description={item.children}
            />
          </List.Item>
        )}
        locale={{ emptyText: '暂无标签页配置' }}
      />

      <Modal
        title={editingItem ? '编辑标签页' : '添加标签页'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="label"
            label="标签页标题"
            rules={[{ required: true, message: '请输入标签页标题' }]}
          >
            <Input placeholder="请输入标签页标题" />
          </Form.Item>

          <Form.Item
            name="children"
            label="标签页内容"
            help="如果有子组件，这里的内容会被覆盖"
          >
            <Input.TextArea 
              rows={3}
              placeholder="请输入标签页内容"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TabsConfigEditor