import React from 'react'
import { 
  Button, 
  Input, 
  Card, 
  Space, 
  Form, 
  Table, 
  Alert,
  Typography,
  Select,
  DatePicker,
  Row,
  Col
} from 'antd'

import { ComponentConfig } from '../types'
import { ActionExecutor } from '../utils/actionExecutor'

const { Text } = Typography
const { TextArea } = Input

interface ComponentRendererProps {
  component: ComponentConfig
  children?: React.ReactNode
}

const ComponentRenderer: React.FC<ComponentRendererProps> = ({ 
  component, 
  children
}) => {
  const { type, props } = component

  // 渲染子组件
  const renderChildren = () => {
    if (children) {
      return children
    }
    return null
  }

  // 根据组件类型渲染对应的组件
  const renderComponent = () => {
    try {
      switch (type) {
        case 'Button':
          const buttonProps = { ...props }
          
          // 如果有配置的动作，添加点击事件
          if (props.actions && props.actions.length > 0) {
            buttonProps.onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault()
              e.stopPropagation()
              ActionExecutor.executeActions(props.actions, {
                buttonElement: e.currentTarget
              })
            }
          }
          
          return <Button {...buttonProps}>{props.children || '按钮'}</Button>

        case 'Input':
          return <Input {...props} />

        case 'TextArea':
          return <TextArea {...props} />

        case 'Select':
          const selectOptions = typeof props.options === 'string' 
            ? JSON.parse(props.options) 
            : props.options || []
          return (
            <Select {...props} style={{ minWidth: '120px' }}>
              {selectOptions.map((option: any, index: number) => (
                <Select.Option key={index} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          )

        case 'DatePicker':
          return <DatePicker {...props} />

        case 'Card':
          return (
            <Card {...props} style={{ minHeight: '120px', ...props.style }}>
              {renderChildren() || <div style={{ 
                padding: '20px', 
                textAlign: 'center', 
                color: '#999',
                minHeight: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>卡片内容</div>}
            </Card>
          )

        case 'Row':
          return (
            <Row {...props} style={{ minHeight: '60px', ...props.style }}>
              {renderChildren() || <div style={{ 
                width: '100%',
                padding: '20px', 
                textAlign: 'center', 
                color: '#999',
                border: '1px dashed #e8e8e8',
                borderRadius: '4px'
              }}>行容器</div>}
            </Row>
          )

        case 'Col':
          return (
            <Col {...props} style={{ minHeight: '60px', ...props.style }}>
              {renderChildren() || <div style={{ 
                padding: '20px', 
                textAlign: 'center', 
                color: '#999',
                border: '1px dashed #e8e8e8',
                borderRadius: '4px',
                minHeight: '40px'
              }}>列容器</div>}
            </Col>
          )

        case 'Space':
          return (
            <Space {...props} style={{ minHeight: '40px', ...props.style }}>
              {children || <Text style={{ color: '#999' }}>间距组件</Text>}
            </Space>
          )

        case 'Form':
          return (
            <Form {...props} style={{ minHeight: '120px', ...props.style }}>
              {children || (
                <>
                  <Form.Item label="示例字段" name="example">
                    <Input placeholder="这是一个示例表单项" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary">提交</Button>
                  </Form.Item>
                </>
              )}
            </Form>
          )

        case 'Table':
          const processedColumns = props.columns?.map((col: any) => {
            if (col.render === 'actions') {
              return {
                ...col,
                render: () => (
                  <Space>
                    <Button size="small" type="link">编辑</Button>
                    <Button size="small" type="link" danger>删除</Button>
                  </Space>
                )
              }
            }
            return col
          })

          const tableProps = {
            ...props,
            columns: processedColumns,
            pagination: props.pagination ? 
              (typeof props.pagination === 'string' ? JSON.parse(props.pagination) : props.pagination) :
              { pageSize: 10 },
            scroll: props.scroll ? 
              (typeof props.scroll === 'string' ? JSON.parse(props.scroll) : props.scroll) :
              undefined
          }
          return <Table {...tableProps} />

        case 'PageListQuery':
          return (
            <div>
              <Card title="查询条件" size="small" style={{ marginBottom: 16 }}>
                <Form layout="inline">
                  <Form.Item label="搜索">
                    <Input placeholder="请输入搜索关键词" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary">查询</Button>
                    <Button style={{ marginLeft: 8 }}>重置</Button>
                  </Form.Item>
                </Form>
              </Card>
              <Card title="数据列表">
                <Table
                  columns={props.tableProps?.columns || [
                    { title: 'ID', dataIndex: 'id', key: 'id' },
                    { title: '名称', dataIndex: 'name', key: 'name' }
                  ]}
                  dataSource={props.tableProps?.dataSource || [
                    { key: '1', id: 1, name: '示例数据1' },
                    { key: '2', id: 2, name: '示例数据2' }
                  ]}
                  pagination={{ pageSize: 5 }}
                />
              </Card>
            </div>
          )

        case 'ModalForm':
          return (
            <div>
              <Button type="primary">
                {props.trigger || '打开表单'}
              </Button>
              <Alert
                message="模态框表单"
                description="点击按钮会打开一个模态框表单"
                type="info"
                style={{ marginTop: 8 }}
              />
            </div>
          )

        default:
          return (
            <Alert
              message="未知组件"
              description={`组件类型 "${type}" 暂不支持预览`}
              type="warning"
            />
          )
      }
    } catch (error) {
      return (
        <Alert
          message="组件渲染错误"
          description={`组件 "${type}" 渲染失败: ${error}`}
          type="error"
        />
      )
    }
  }

  // 判断是否为输入类组件，这些组件不需要额外的边框
  const isInputComponent = ['Input', 'TextArea', 'Select', 'DatePicker', 'Button'].includes(type)
  
  return (
    <div style={{ 
      width: '100%',
      // 输入类组件不需要额外的容器样式
      ...(isInputComponent ? {} : {})
    }}>
      {renderComponent()}
    </div>
  )
}

export default ComponentRenderer