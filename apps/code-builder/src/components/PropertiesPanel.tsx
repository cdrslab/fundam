import React from 'react'
import {
  Typography,
  Form,
  Input,
  Select,
  Switch,
  InputNumber,
  ColorPicker,
  Empty,
  Card,
  Space,
  Divider,
  Button,
  Collapse,
  Tag,
  Tooltip,
  Alert
} from 'antd'
import {
  SettingOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  CodeOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import type { ComponentConfig } from '../types'
import useCodeBuilderStore from '../store'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input
const { Option } = Select

interface PropertiesPanelProps {
  selectedComponent?: ComponentConfig
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedComponent
}) => {
  const [form] = Form.useForm()
  const {
    updateComponentProps,
    setComponentVisibility,
    globalConfig
  } = useCodeBuilderStore()

  // 组件属性定义
  const getComponentPropDefinitions = (componentType: string) => {
    const commonProps = [
      { name: 'style', label: '样式', type: 'json', placeholder: '{"margin": "16px"}' },
      { name: 'className', label: 'CSS类名', type: 'string' },
      { name: 'id', label: 'DOM ID', type: 'string' }
    ]

    const specificProps: Record<string, any[]> = {
      'Button': [
        { name: 'type', label: '按钮类型', type: 'select', options: [
          { label: '默认', value: 'default' },
          { label: '主要', value: 'primary' },
          { label: '虚线', value: 'dashed' },
          { label: '链接', value: 'link' },
          { label: '文本', value: 'text' }
        ]},
        { name: 'size', label: '按钮大小', type: 'select', options: [
          { label: '大', value: 'large' },
          { label: '中', value: 'middle' },
          { label: '小', value: 'small' }
        ]},
        { name: 'children', label: '按钮文字', type: 'string', defaultValue: '按钮' },
        { name: 'loading', label: '加载状态', type: 'boolean' },
        { name: 'disabled', label: '禁用状态', type: 'boolean' },
        { name: 'danger', label: '危险按钮', type: 'boolean' },
        { name: 'icon', label: '图标', type: 'string', placeholder: 'PlusOutlined' }
      ],

      'FormItemInput': [
        { name: 'name', label: '字段名', type: 'string', required: true },
        { name: 'label', label: '标签', type: 'string', required: true },
        { name: 'placeholder', label: '占位符', type: 'string' },
        { name: 'required', label: '必填', type: 'boolean' },
        { name: 'disabled', label: '禁用', type: 'boolean' },
        { name: 'maxLength', label: '最大长度', type: 'number' },
        { name: 'showCount', label: '显示字符数', type: 'boolean' }
      ],

      'FormItemSelect': [
        { name: 'name', label: '字段名', type: 'string', required: true },
        { name: 'label', label: '标签', type: 'string', required: true },
        { name: 'placeholder', label: '占位符', type: 'string' },
        { name: 'required', label: '必填', type: 'boolean' },
        { name: 'disabled', label: '禁用', type: 'boolean' },
        { name: 'mode', label: '选择模式', type: 'select', options: [
          { label: '单选', value: undefined },
          { label: '多选', value: 'multiple' },
          { label: '标签', value: 'tags' }
        ]},
        { name: 'options', label: '选项配置', type: 'json',
          placeholder: '[{"label":"选项1","value":"1"}]',
          defaultValue: [
            { label: '选项1', value: 'option1' },
            { label: '选项2', value: 'option2' }
          ]
        }
      ],

      'PageListQuery': [
        { name: 'title', label: '页面标题', type: 'string' },
        { name: 'tableProps', label: '表格配置', type: 'json',
          placeholder: '{"columns":[],"dataSource":[]}' }
      ],

      'Card': [
        { name: 'title', label: '卡片标题', type: 'string' },
        { name: 'size', label: '卡片大小', type: 'select', options: [
          { label: '默认', value: 'default' },
          { label: '小', value: 'small' }
        ]},
        { name: 'bordered', label: '显示边框', type: 'boolean', defaultValue: true },
        { name: 'hoverable', label: '悬停效果', type: 'boolean' }
      ],

      'Modal': [
        { name: 'title', label: '弹窗标题', type: 'string', defaultValue: '弹窗' },
        { name: 'width', label: '弹窗宽度', type: 'number', defaultValue: 520 },
        { name: 'centered', label: '居中显示', type: 'boolean' },
        { name: 'maskClosable', label: '点击遮罩关闭', type: 'boolean', defaultValue: true },
        { name: 'closable', label: '显示关闭按钮', type: 'boolean', defaultValue: true }
      ],

      'Table': [
        { name: 'columns', label: '表格列配置', type: 'json',
          placeholder: '[{"title":"列名","dataIndex":"field","key":"field"}]' },
        { name: 'dataSource', label: '数据源', type: 'json',
          placeholder: '[{"key":"1","field":"value"}]' },
        { name: 'pagination', label: '分页配置', type: 'json',
          placeholder: '{"pageSize":10,"showQuickJumper":true}' },
        { name: 'size', label: '表格大小', type: 'select', options: [
          { label: '默认', value: 'middle' },
          { label: '小', value: 'small' },
          { label: '大', value: 'large' }
        ]},
        { name: 'bordered', label: '显示边框', type: 'boolean' },
        { name: 'loading', label: '加载状态', type: 'boolean' }
      ]
    }

    return [...(specificProps[componentType] || []), ...commonProps]
  }

  // 当选中组件变化时，更新表单值
  React.useEffect(() => {
    if (selectedComponent) {
      const propDefinitions = getComponentPropDefinitions(selectedComponent.identity.type)
      const formValues: Record<string, any> = {}

      propDefinitions.forEach(propDef => {
        const currentValue = selectedComponent.props[propDef.name] ?? propDef.defaultValue
        formValues[propDef.name] = currentValue
      })

      form.setFieldsValue(formValues)
    }
  }, [selectedComponent?.identity.id, form])

  // 处理属性变更
  const handlePropertyChange = (changedValues: Record<string, any>) => {
    if (!selectedComponent) return

    // 处理JSON类型的值
    const processedValues: Record<string, any> = {}
    Object.entries(changedValues).forEach(([key, value]) => {
      const propDef = getComponentPropDefinitions(selectedComponent.identity.type)
        .find(def => def.name === key)

      if (propDef?.type === 'json' && typeof value === 'string') {
        try {
          processedValues[key] = JSON.parse(value)
        } catch (error) {
          // 如果JSON解析失败，保持原始字符串
          processedValues[key] = value
        }
      } else {
        processedValues[key] = value
      }
    })

    updateComponentProps(selectedComponent.identity.id, processedValues)
  }

  // 切换组件可见性
  const handleToggleVisibility = () => {
    if (!selectedComponent) return
    setComponentVisibility(selectedComponent.identity.id, !selectedComponent.isVisible)
  }

  // 渲染属性控件
  const renderPropertyControl = (propDef: any) => {
    const { name, label, type, options, required, placeholder, defaultValue } = propDef

    switch (type) {
      case 'string':
        return (
          <Form.Item
            key={name}
            label={label}
            name={name}
            rules={required ? [{ required: true, message: `请输入${label}` }] : []}
          >
            <Input placeholder={placeholder || `请输入${label}`} />
          </Form.Item>
        )

      case 'textarea':
        return (
          <Form.Item
            key={name}
            label={label}
            name={name}
            rules={required ? [{ required: true, message: `请输入${label}` }] : []}
          >
            <TextArea
              placeholder={placeholder || `请输入${label}`}
              autoSize={{ minRows: 2, maxRows: 4 }}
            />
          </Form.Item>
        )

      case 'number':
        return (
          <Form.Item
            key={name}
            label={label}
            name={name}
            rules={required ? [{ required: true, message: `请输入${label}` }] : []}
          >
            <InputNumber
              placeholder={placeholder || `请输入${label}`}
              style={{ width: '100%' }}
            />
          </Form.Item>
        )

      case 'boolean':
        return (
          <Form.Item
            key={name}
            label={label}
            name={name}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        )

      case 'select':
        return (
          <Form.Item
            key={name}
            label={label}
            name={name}
            rules={required ? [{ required: true, message: `请选择${label}` }] : []}
          >
            <Select placeholder={placeholder || `请选择${label}`}>
              {options?.map((option: any) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )

      case 'color':
        return (
          <Form.Item
            key={name}
            label={label}
            name={name}
          >
            <ColorPicker />
          </Form.Item>
        )

      case 'json':
        return (
          <Form.Item
            key={name}
            label={
              <Space>
                {label}
                <Tooltip title={`JSON格式，示例: ${placeholder}`}>
                  <InfoCircleOutlined style={{ color: '#999' }} />
                </Tooltip>
              </Space>
            }
            name={name}
            rules={[
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve()
                  try {
                    JSON.parse(typeof value === 'string' ? value : JSON.stringify(value))
                    return Promise.resolve()
                  } catch (error) {
                    return Promise.reject(new Error('请输入有效的JSON格式'))
                  }
                }
              }
            ]}
          >
            <TextArea
              placeholder={placeholder}
              autoSize={{ minRows: 3, maxRows: 8 }}
            />
          </Form.Item>
        )

      default:
        return (
          <Form.Item
            key={name}
            label={label}
            name={name}
          >
            <Input placeholder={placeholder || `请输入${label}`} />
          </Form.Item>
        )
    }
  }

  // 如果没有选中组件
  if (!selectedComponent) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #e8e8e8',
          background: '#fafafa'
        }}>
          <Space>
            <SettingOutlined />
            <Title level={5} style={{ margin: 0 }}>属性配置</Title>
          </Space>
        </div>

        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px'
        }}>
          <Empty
            description="请选择一个组件来配置属性"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      </div>
    )
  }

  const propDefinitions = getComponentPropDefinitions(selectedComponent.identity.type)

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 头部 */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #e8e8e8',
        background: '#fafafa'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Space>
              <SettingOutlined />
              <Title level={5} style={{ margin: 0 }}>属性配置</Title>
            </Space>
            <div style={{ marginTop: 8 }}>
              <Text strong style={{ fontSize: '13px' }}>
                {selectedComponent.identity.name}
              </Text>
              <div style={{ fontSize: '11px', color: '#999', marginTop: 2 }}>
                {selectedComponent.identity.type} • {selectedComponent.identity.id.slice(-8)}
              </div>
            </div>
          </div>

          <Space>
            <Tooltip title={selectedComponent.isVisible ? '隐藏组件' : '显示组件'}>
              <Button
                size="small"
                type="text"
                icon={selectedComponent.isVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                onClick={handleToggleVisibility}
                style={{
                  color: selectedComponent.isVisible ? '#52c41a' : '#ff4d4f'
                }}
              />
            </Tooltip>

            <Tooltip title="查看组件代码">
              <Button
                size="small"
                type="text"
                icon={<CodeOutlined />}
                onClick={() => {
                  // TODO: 跳转到代码位置
                  console.log('跳转到组件代码位置')
                }}
              />
            </Tooltip>
          </Space>
        </div>
      </div>

      {/* 属性表单 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {/* AI功能摘要 */}
        {selectedComponent.aiSummary && (
          <Alert
            message="AI功能总结"
            description={selectedComponent.aiSummary}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            action={
              <Button size="small" type="link">
                查看详情
              </Button>
            }
          />
        )}

        {/* 组件状态标签 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Tag color={selectedComponent.isVisible ? 'green' : 'red'}>
              {selectedComponent.isVisible ? '可见' : '隐藏'}
            </Tag>
            {Object.keys(selectedComponent.events).length > 0 && (
              <Tag color="blue">
                {Object.keys(selectedComponent.events).length} 个事件
              </Tag>
            )}
            {selectedComponent.identity.children?.length > 0 && (
              <Tag color="purple">
                {selectedComponent.identity.children.length} 个子组件
              </Tag>
            )}
          </Space>
        </div>

        {/* 属性配置表单 */}
        <Form
          form={form}
          layout="vertical"
          onValuesChange={handlePropertyChange}
          size="small"
        >
          {propDefinitions.length > 0 ? (
            <Collapse
              ghost
              defaultActiveKey={['basic', 'advanced']}
              items={[
                {
                  key: 'basic',
                  label: '基础属性',
                  children: (
                    <div>
                      {propDefinitions
                        .filter(def => !['style', 'className', 'id'].includes(def.name))
                        .map(renderPropertyControl)
                      }
                    </div>
                  )
                },
                {
                  key: 'advanced',
                  label: '高级属性',
                  children: (
                    <div>
                      {propDefinitions
                        .filter(def => ['style', 'className', 'id'].includes(def.name))
                        .map(renderPropertyControl)
                      }
                    </div>
                  )
                }
              ]}
            />
          ) : (
            <Empty
              description="该组件暂无可配置属性"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Form>

        {/* 事件处理器 */}
        {Object.keys(selectedComponent.events).length > 0 && (
          <>
            <Divider>事件处理</Divider>
            <div>
              {Object.entries(selectedComponent.events).map(([eventType, eventConfig]) => (
                <Card key={eventType} size="small" style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>{eventType}</Text>
                      {eventConfig.description && (
                        <div style={{ fontSize: '12px', color: '#666', marginTop: 2 }}>
                          {eventConfig.description}
                        </div>
                      )}
                    </div>
                    <Button size="small" type="link">
                      编辑
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default PropertiesPanel
