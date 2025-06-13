import React, { useState } from 'react'
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  Switch, 
  Button, 
  Space,
  List,
  Card,
  Popconfirm,
  InputNumber,
  Typography
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, DragOutlined } from '@ant-design/icons'

import { ButtonAction, ActionTemplate, actionTemplates } from '../types/actions'
import { globalConfigManager } from '../store/globalConfig'
import { useCanvasComponents } from '../hooks/useCanvasComponents'
import ApiSelector from './ApiSelector'

const { TextArea } = Input
const { Text } = Typography

interface ButtonActionEditorProps {
  actions: ButtonAction[]
  onChange: (actions: ButtonAction[]) => void
}

const ButtonActionEditor: React.FC<ButtonActionEditorProps> = ({ 
  actions, 
  onChange 
}) => {
  const allComponents = useCanvasComponents()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingAction, setEditingAction] = useState<ButtonAction | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<ActionTemplate | null>(null)
  const [form] = Form.useForm()

  const handleAdd = () => {
    setEditingAction(null)
    setSelectedTemplate(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEdit = (action: ButtonAction) => {
    setEditingAction(action)
    const template = actionTemplates.find(t => t.type === action.type)
    setSelectedTemplate(template || null)
    form.setFieldsValue({
      type: action.type,
      ...action.config
    })
    setIsModalVisible(true)
  }

  const handleDelete = (index: number) => {
    const newActions = [...actions]
    newActions.splice(index, 1)
    onChange(newActions)
  }

  const handleTemplateChange = (actionType: string) => {
    const template = actionTemplates.find(t => t.type === actionType)
    setSelectedTemplate(template || null)
    if (template) {
      // 设置默认值
      const defaultValues: Record<string, any> = { type: actionType }
      template.configSchema.forEach(schema => {
        if (schema.defaultValue !== undefined) {
          defaultValues[schema.name] = schema.defaultValue
        }
      })
      form.setFieldsValue(defaultValues)
    }
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      const { type, ...config } = values
      
      const newAction: ButtonAction = {
        id: editingAction?.id || `action_${Date.now()}`,
        type,
        config
      }
      
      const newActions = [...actions]
      if (editingAction) {
        const index = actions.findIndex(a => a.id === editingAction.id)
        newActions[index] = newAction
      } else {
        newActions.push(newAction)
      }
      
      onChange(newActions)
      setIsModalVisible(false)
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  // 渲染配置项
  const renderConfigField = (schema: any) => {
    const { name, label, type, required, options, description } = schema
    
    switch (type) {
      case 'string':
        return (
          <Form.Item
            key={name}
            name={name}
            label={label}
            rules={required ? [{ required: true, message: `请输入${label}` }] : []}
            help={description}
          >
            <Input />
          </Form.Item>
        )
        
      case 'textarea':
        return (
          <Form.Item
            key={name}
            name={name}
            label={label}
            rules={required ? [{ required: true, message: `请输入${label}` }] : []}
            help={description}
          >
            <TextArea rows={3} />
          </Form.Item>
        )
        
      case 'number':
        return (
          <Form.Item
            key={name}
            name={name}
            label={label}
            rules={required ? [{ required: true, message: `请输入${label}` }] : []}
            help={description}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        )
        
      case 'boolean':
        return (
          <Form.Item
            key={name}
            name={name}
            label={label}
            valuePropName="checked"
            help={description}
          >
            <Switch />
          </Form.Item>
        )
        
      case 'select':
        return (
          <Form.Item
            key={name}
            name={name}
            label={label}
            rules={required ? [{ required: true, message: `请选择${label}` }] : []}
            help={description}
          >
            <Select>
              {options?.map((option: any) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )
        
      case 'api_select':
        return (
          <Form.Item
            key={name}
            name={name}
            label={label}
            rules={required ? [{ required: true, message: `请选择${label}` }] : []}
            help={description}
          >
            <ApiSelector placeholder={`请选择${label}`} />
          </Form.Item>
        )
        
      case 'modal_select':
        const modals = globalConfigManager.getConfig().modals
        return (
          <Form.Item
            key={name}
            name={name}
            label={label}
            rules={required ? [{ required: true, message: `请选择${label}` }] : []}
            help={description}
          >
            <Select>
              {modals.map(modal => (
                <Select.Option key={modal.id} value={modal.id}>
                  {modal.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )

      case 'table_select':
        const tableComponents = allComponents.filter(comp => comp.type === 'Table' || comp.type === 'PageListQuery')
        return (
          <Form.Item
            key={name}
            name={name}
            label={label}
            rules={required ? [{ required: true, message: `请选择${label}` }] : []}
            help={description || '选择要刷新的表格组件'}
          >
            <Select placeholder="请选择表格" allowClear>
              {tableComponents.map(comp => (
                <Select.Option key={comp.id} value={comp.id}>
                  {comp.name || comp.type} ({comp.id.slice(-8)})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )

      case 'form_select':
        const formComponents = allComponents.filter(comp => comp.type === 'Form')
        return (
          <Form.Item
            key={name}
            name={name}
            label={label}
            rules={required ? [{ required: true, message: `请选择${label}` }] : []}
            help={description || '选择要收集数据的表单'}
          >
            <Select placeholder="请选择表单" allowClear>
              {formComponents.map(comp => (
                <Select.Option key={comp.id} value={comp.id}>
                  {comp.name || comp.type} ({comp.id.slice(-8)})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )
        
      default:
        return null
    }
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'modal': return '🪟'
      case 'api': return '🔗'
      case 'form_submit': return '📝'
      case 'table_refresh': return '🔄'
      case 'navigation': return '🔀'
      case 'custom': return '💻'
      default: return '⚡'
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
          添加动作
        </Button>
      </div>

      <List
        size="small"
        dataSource={actions}
        renderItem={(action, index) => (
          <List.Item
            actions={[
              <Button
                key="edit"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEdit(action)}
              />,
              <Popconfirm
                key="delete"
                title="确定删除这个动作吗？"
                onConfirm={() => handleDelete(index)}
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
              avatar={<span style={{ fontSize: '16px' }}>{getActionIcon(action.type)}</span>}
              title={actionTemplates.find(t => t.type === action.type)?.name || action.type}
              description={actionTemplates.find(t => t.type === action.type)?.description || '自定义动作'}
            />
          </List.Item>
        )}
        locale={{ emptyText: '暂无动作配置' }}
      />

      <Modal
        title={editingAction ? '编辑动作' : '添加动作'}
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
            name="type"
            label="动作类型"
            rules={[{ required: true, message: '请选择动作类型' }]}
          >
            <Select onChange={handleTemplateChange} placeholder="选择动作类型">
              {actionTemplates.map(template => (
                <Select.Option key={template.type} value={template.type}>
                  {template.name} - {template.description}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>


          {selectedTemplate && (
            <Card title="动作配置" size="small">
              {selectedTemplate.configSchema.map(renderConfigField)}
            </Card>
          )}
        </Form>
      </Modal>
    </div>
  )
}

export default ButtonActionEditor