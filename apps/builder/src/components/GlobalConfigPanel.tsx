import React, { useState } from 'react'
import { 
  Modal, 
  Tabs, 
  Table, 
  Button, 
  Form, 
  Input, 
  Select, 
  Space,
  Popconfirm,
  Typography,
  message,
  InputNumber
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons'

import { globalConfigManager, ApiConfig, ModalConfig } from '../store/globalConfig'

// const { TabPane } = Tabs  // 已废弃，使用items替代
const { Text } = Typography

interface GlobalConfigPanelProps {
  visible: boolean
  onClose: () => void
}

const GlobalConfigPanel: React.FC<GlobalConfigPanelProps> = ({ visible, onClose }) => {
  const [activeTab, setActiveTab] = useState('apis')
  const [apiModalVisible, setApiModalVisible] = useState(false)
  const [modalModalVisible, setModalModalVisible] = useState(false)
  const [editingApi, setEditingApi] = useState<ApiConfig | null>(null)
  const [editingModal, setEditingModal] = useState<ModalConfig | null>(null)
  const [apiForm] = Form.useForm()
  const [modalForm] = Form.useForm()

  const config = globalConfigManager.getConfig()

  // API管理
  const handleAddApi = () => {
    setEditingApi(null)
    apiForm.resetFields()
    setApiModalVisible(true)
  }

  const handleEditApi = (api: ApiConfig) => {
    setEditingApi(api)
    apiForm.setFieldsValue(api)
    setApiModalVisible(true)
  }

  const handleDeleteApi = (id: string) => {
    globalConfigManager.deleteApi(id)
    message.success('删除成功')
  }

  const handleSaveApi = async () => {
    try {
      const values = await apiForm.validateFields()
      if (editingApi) {
        globalConfigManager.updateApi(editingApi.id, values)
        message.success('更新成功')
      } else {
        const newApi: ApiConfig = {
          id: `api_${Date.now()}`,
          ...values
        }
        globalConfigManager.addApi(newApi)
        message.success('添加成功')
      }
      setApiModalVisible(false)
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  // Modal管理
  const handleAddModal = () => {
    setEditingModal(null)
    modalForm.resetFields()
    setModalModalVisible(true)
  }

  const handleEditModal = (modal: ModalConfig) => {
    setEditingModal(modal)
    modalForm.setFieldsValue(modal)
    setModalModalVisible(true)
  }

  const handleDeleteModal = (id: string) => {
    globalConfigManager.deleteModal(id)
    message.success('删除成功')
  }

  const handleSaveModal = async () => {
    try {
      const values = await modalForm.validateFields()
      if (editingModal) {
        globalConfigManager.updateModal(editingModal.id, values)
        message.success('更新成功')
      } else {
        const newModal: ModalConfig = {
          id: `modal_${Date.now()}`,
          ...values
        }
        globalConfigManager.addModal(newModal)
        message.success('添加成功')
      }
      setModalModalVisible(false)
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  const apiColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 150 },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '方法', dataIndex: 'method', key: 'method', width: 80 },
    { title: 'URL', dataIndex: 'url', key: 'url' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: ApiConfig) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditApi(record)}
          />
          <Popconfirm
            title="确定删除这个API吗？"
            onConfirm={() => handleDeleteApi(record.id)}
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

  const modalColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 150 },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '宽度', dataIndex: 'width', key: 'width', width: 80 },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: ModalConfig) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditModal(record)}
          />
          <Popconfirm
            title="确定删除这个弹窗吗？"
            onConfirm={() => handleDeleteModal(record.id)}
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
    <>
      <Modal
        title="全局配置"
        open={visible}
        onCancel={onClose}
        width={1000}
        footer={null}
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: 'apis',
              label: 'API接口',
              children: (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddApi}
                    >
                      添加API
                    </Button>
                  </div>
                  <Table
                    columns={apiColumns}
                    dataSource={config.apis}
                    rowKey="id"
                    size="small"
                    pagination={{ pageSize: 10 }}
                  />
                </>
              )
            },
            {
              key: 'modals',
              label: '弹窗配置',
              children: (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddModal}
                    >
                      添加弹窗
                    </Button>
                  </div>
                  <Table
                    columns={modalColumns}
                    dataSource={config.modals}
                    rowKey="id"
                    size="small"
                    pagination={{ pageSize: 10 }}
                  />
                </>
              )
            },
            {
              key: 'theme',
              label: '主题设置',
              children: (
                <Form layout="vertical">
                  <Form.Item label="主色调">
                    <Input value={config.theme.primaryColor} disabled />
                  </Form.Item>
                  <Form.Item label="圆角大小">
                    <InputNumber value={config.theme.borderRadius} disabled />
                  </Form.Item>
                </Form>
              )
            }
          ]}
        />
      </Modal>

      {/* API编辑弹窗 */}
      <Modal
        title={editingApi ? '编辑API' : '添加API'}
        open={apiModalVisible}
        onOk={handleSaveApi}
        onCancel={() => setApiModalVisible(false)}
        width={600}
      >
        <Form form={apiForm} layout="vertical">
          <Form.Item
            name="name"
            label="API名称"
            rules={[{ required: true, message: '请输入API名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="method"
            label="请求方法"
            rules={[{ required: true, message: '请选择请求方法' }]}
          >
            <Select>
              <Select.Option value="GET">GET</Select.Option>
              <Select.Option value="POST">POST</Select.Option>
              <Select.Option value="PUT">PUT</Select.Option>
              <Select.Option value="DELETE">DELETE</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="url"
            label="URL地址"
            rules={[{ required: true, message: '请输入URL地址' }]}
          >
            <Input placeholder="/api/users" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 弹窗编辑弹窗 */}
      <Modal
        title={editingModal ? '编辑弹窗' : '添加弹窗'}
        open={modalModalVisible}
        onOk={handleSaveModal}
        onCancel={() => setModalModalVisible(false)}
        width={600}
      >
        <Form form={modalForm} layout="vertical">
          <Form.Item
            name="name"
            label="弹窗名称"
            rules={[{ required: true, message: '请输入弹窗名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="title"
            label="弹窗标题"
            rules={[{ required: true, message: '请输入弹窗标题' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="width" label="宽度">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="height" label="高度">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default GlobalConfigPanel