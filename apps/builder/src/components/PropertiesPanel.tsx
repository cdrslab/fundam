import React, { useEffect } from 'react'
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
  Divider
} from 'antd'
import { SettingOutlined } from '@ant-design/icons'

import { ComponentConfig, PropTypeDefinition } from '../types'
import { componentDefinitions } from '../config/components'
import TableColumnEditor from './TableColumnEditor'
import ButtonActionEditor from './ButtonActionEditor'
import FormBasedTableColumnEditor from './FormBasedTableColumnEditor'
import FormBasedSelectOptionsEditor from './FormBasedSelectOptionsEditor'
import TableScrollConfig from './TableScrollConfig'
import TablePaginationConfig from './TablePaginationConfig'
import PageListQueryFormConfig from './PageListQueryFormConfig'
import ApiSelector from './ApiSelector'
import TabsConfigEditor from './TabsConfigEditor'
import CollapseConfigEditor from './CollapseConfigEditor'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

interface PropertiesPanelProps {
  component?: ComponentConfig
  onUpdateComponent: (id: string, props: Record<string, any>) => void
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  component,
  onUpdateComponent
}) => {
  const [form] = Form.useForm()

  // 当组件变化时，重置表单值
  useEffect(() => {
    if (component) {
      const formValues: Record<string, any> = {}
      const componentDef = componentDefinitions.find(def => def.type === component.type)
      
      if (componentDef) {
        componentDef.propTypes.forEach(propType => {
          const currentValue = component.props[propType.name] ?? propType.defaultValue
          formValues[propType.name] = currentValue
        })
      }
      
      form.setFieldsValue(formValues)
    }
  }, [component?.id, form]) // 只在组件ID变化时触发

  // 如果没有选中组件，显示空状态
  if (!component) {
    return (
      <div style={{ padding: '24px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Empty
          description="请选择一个组件来配置属性"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    )
  }

  // 获取组件定义
  const componentDef = componentDefinitions.find(def => def.type === component.type)
  if (!componentDef) {
    return (
      <div style={{ padding: '16px' }}>
        <Text type="secondary">未找到组件定义</Text>
      </div>
    )
  }

  // 处理属性变更
  const handlePropertyChange = (changedValues: Record<string, any>) => {
    const newProps = { ...component.props, ...changedValues }
    onUpdateComponent(component.id, newProps)
  }

  // 渲染属性控件
  const renderPropertyControl = (propType: PropTypeDefinition) => {
    const { name, type, label, options } = propType

    switch (type) {
      case 'string':
        return (
          <Form.Item
            key={name}
            label={label}
            name={name}
          >
            <Input placeholder={`请输入${label}`} />
          </Form.Item>
        )

      case 'textarea':
        return (
          <Form.Item
            key={name}
            label={label}
            name={name}
          >
            <TextArea placeholder={`请输入${label}`} autoSize={{ minRows: 2, maxRows: 4 }} />
          </Form.Item>
        )

      case 'number':
        return (
          <Form.Item
            key={name}
            label={label}
            name={name}
          >
            <InputNumber placeholder={`请输入${label}`} style={{ width: '100%' }} />
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
          >
            <Select placeholder={`请选择${label}`}>
              {options?.map(option => (
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
            label={label}
            name={name}
          >
            <TextArea 
              placeholder={`请输入${label}（JSON格式）`}
              autoSize={{ minRows: 3, maxRows: 8 }}
            />
          </Form.Item>
        )

      case 'tabs_config':
        return (
          <Form.Item
            key={name}
            label={label}
            name={name}
          >
            <TabsConfigEditor />
          </Form.Item>
        )

      case 'collapse_config':
        return (
          <Form.Item
            key={name}
            label={label}
            name={name}
          >
            <CollapseConfigEditor />
          </Form.Item>
        )

      default:
        return (
          <Form.Item
            key={name}
            label={label}
            name={name}
          >
            <Input placeholder={`请输入${label}`} />
          </Form.Item>
        )
    }
  }

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #e8e8e8' }}>
        <Space>
          <SettingOutlined />
          <Title level={5} style={{ margin: 0 }}>属性配置</Title>
        </Space>
      </div>

      <div style={{ padding: '16px' }}>
        <Card size="small" style={{ marginBottom: '16px' }}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div>
              <Text strong>组件类型：</Text>
              <Text code>{component.type}</Text>
            </div>
            <div>
              <Text strong>组件ID：</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>{component.id}</Text>
            </div>
          </Space>
        </Card>

        <Form
          form={form}
          layout="vertical"
          onValuesChange={handlePropertyChange}
          size="small"
        >
          {componentDef.propTypes.map(renderPropertyControl)}
        </Form>

        {/* 特殊属性配置 */}
        {component.type === 'Table' && (
          <>
            <Divider>表格配置</Divider>
            <Card title="列配置" size="small" style={{ marginBottom: '16px' }}>
              <FormBasedTableColumnEditor
                columns={component.props.columns || []}
                onChange={(columns) => handlePropertyChange({ columns })}
              />
            </Card>

            <TableScrollConfig
              value={component.props.scroll || {}}
              onChange={(scroll) => handlePropertyChange({ scroll })}
            />

            <div style={{ marginBottom: '16px' }} />

            <TablePaginationConfig
              value={component.props.pagination || {}}
              onChange={(pagination) => handlePropertyChange({ pagination })}
            />

            <Card title="数据源配置" size="small" style={{ marginTop: '16px' }}>
              <Form.Item label="数据源（JSON）">
                <TextArea
                  value={JSON.stringify(component.props.dataSource || [], null, 2)}
                  onChange={(e) => {
                    try {
                      const dataSource = JSON.parse(e.target.value)
                      handlePropertyChange({ dataSource })
                    } catch (error) {
                      // 忽略JSON解析错误
                    }
                  }}
                  autoSize={{ minRows: 3, maxRows: 8 }}
                  placeholder="请输入表格数据源（JSON格式）"
                />
              </Form.Item>
            </Card>
          </>
        )}

        {component.type === 'Select' && (
          <>
            <Divider>选择器配置</Divider>
            <Card title="选项配置" size="small" style={{ marginBottom: '16px' }}>
              <FormBasedSelectOptionsEditor
                options={Array.isArray(component.props.options) ? component.props.options : []}
                onChange={(options) => handlePropertyChange({ options })}
              />
            </Card>
          </>
        )}

        {(component.type === 'Input' || component.type === 'TextArea') && (
          <>
            <Divider>表单验证</Divider>
            <Card title="验证规则" size="small" style={{ marginBottom: '16px' }}>
              <Form.Item label="验证规则（JSON）">
                <TextArea
                  value={JSON.stringify(component.props.rules || [], null, 2)}
                  onChange={(e) => {
                    try {
                      const rules = JSON.parse(e.target.value)
                      handlePropertyChange({ rules })
                    } catch (error) {
                      // 忽略JSON解析错误
                    }
                  }}
                  autoSize={{ minRows: 2, maxRows: 6 }}
                  placeholder='[{"required": true, "message": "请输入内容"}]'
                />
              </Form.Item>
            </Card>
          </>
        )}

        {component.type === 'Button' && (
          <>
            <Divider>按钮动作</Divider>
            <Card title="动作配置" size="small" style={{ marginBottom: '16px' }}>
              <ButtonActionEditor
                actions={component.props.actions || []}
                onChange={(actions) => handlePropertyChange({ actions })}
              />
            </Card>
          </>
        )}

        {component.type === 'PageListQuery' && (
          <>
            <Divider>页面配置</Divider>
            <Card title="查询表单配置" size="small" style={{ marginBottom: '16px' }}>
              <PageListQueryFormConfig
                value={component.props.formItems || []}
                onChange={(formItems) => handlePropertyChange({ formItems })}
              />
            </Card>

            <Card title="表格配置" size="small" style={{ marginBottom: '16px' }}>
              <Form.Item label="数据接口">
                <ApiSelector
                  value={component.props.tableProps?.dataApi || ''}
                  onChange={(dataApi) => {
                    const tableProps = { ...component.props.tableProps, dataApi }
                    handlePropertyChange({ tableProps })
                  }}
                  placeholder="请选择数据接口"
                />
              </Form.Item>
              
              <Form.Item label="表格列配置">
                <FormBasedTableColumnEditor
                  columns={component.props.tableProps?.columns || []}
                  onChange={(columns) => {
                    const tableProps = { ...component.props.tableProps, columns }
                    handlePropertyChange({ tableProps })
                  }}
                />
              </Form.Item>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

export default PropertiesPanel