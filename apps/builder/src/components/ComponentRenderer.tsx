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
  Col,
  Image,
  Divider,
  Tag,
  Checkbox,
  Radio,
  Switch,
  Slider,
  Rate,
  Statistic,
  Progress,
  Badge,
  Tabs,
  Collapse,
  Avatar,
  Timeline
} from 'antd'
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  GlobalOutlined
} from '@ant-design/icons'

import type { ComponentConfig } from '../types'
import { ActionExecutor } from '../utils/actionExecutor'

const { Text, Title } = Typography
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
          // 渲染查询表单项
          const renderFormItems = () => {
            if (props.formItems && Array.isArray(props.formItems)) {
              return props.formItems.map((item: any, index: number) => {
                switch (item.type) {
                  case 'FormItemInput':
                    return (
                      <Form.Item key={index} label={item.label} name={item.name}>
                        <Input placeholder={`请输入${item.label}`} />
                      </Form.Item>
                    )
                  case 'FormItemSelect':
                    return (
                      <Form.Item key={index} label={item.label} name={item.name}>
                        <Select placeholder={`请选择${item.label}`} style={{ minWidth: 120 }}>
                          {item.options?.map((option: any, optIndex: number) => (
                            <Select.Option key={optIndex} value={option.value}>
                              {option.label}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    )
                  default:
                    return null
                }
              })
            }

            // 默认搜索框
            return (
              <Form.Item label="搜索">
                <Input placeholder="请输入搜索关键词" />
              </Form.Item>
            )
          }

          // 处理表格列，确保操作列有正确的render函数
          const processedTableColumns = props.tableProps?.columns?.map((col: any) => {
            if (col.render === 'action' || col.dataIndex === 'action' || col.title === '操作') {
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
          }) || [
            { title: 'ID', dataIndex: 'id', key: 'id' },
            { title: '名称', dataIndex: 'name', key: 'name' }
          ]

          return (
            <div>
              <Card title="查询条件" size="small" style={{ marginBottom: 16 }}>
                <Form layout="inline">
                  {renderFormItems()}
                  <Form.Item>
                    <Button type="primary">查询</Button>
                    <Button style={{ marginLeft: 8 }}>重置</Button>
                  </Form.Item>
                </Form>
              </Card>
              <Card title={props.tableProps?.title || "数据列表"}>
                <Table
                  columns={processedTableColumns}
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

        case 'Text':
          return (
            <Text
              type={props.type}
              strong={props.strong}
              italic={props.italic}
              underline={props.underline}
              delete={props.delete}
            >
              {props.children || '这是一段文本'}
            </Text>
          )

        case 'Title':
          return (
            <Title level={props.level || 1}>
              {props.children || '页面标题'}
            </Title>
          )

        case 'Image':
          return (
            <Image
              src={props.src}
              alt={props.alt}
              width={props.width}
              height={props.height}
              preview={props.preview}
            />
          )

        case 'Divider':
          return (
            <Divider
              type={props.type}
              orientation={props.orientation}
            >
              {props.children}
            </Divider>
          )

        case 'Tag':
          return (
            <Tag
              color={props.color}
              closable={props.closable}
            >
              {props.children || '标签'}
            </Tag>
          )

        case 'Checkbox':
          return (
            <Checkbox
              checked={props.checked}
              disabled={props.disabled}
              indeterminate={props.indeterminate}
            >
              {props.children || '选项'}
            </Checkbox>
          )

        case 'CheckboxGroup':
          return (
            <Checkbox.Group
              options={props.options}
              disabled={props.disabled}
            />
          )

        case 'Radio':
          return (
            <Radio
              checked={props.checked}
              disabled={props.disabled}
            >
              {props.children || '选项'}
            </Radio>
          )

        case 'RadioGroup':
          return (
            <Radio.Group
              options={props.options}
              disabled={props.disabled}
              buttonStyle={props.buttonStyle}
            />
          )

        case 'Switch':
          return (
            <Switch
              checked={props.checked}
              disabled={props.disabled}
              size={props.size}
              checkedChildren={props.checkedChildren}
              unCheckedChildren={props.unCheckedChildren}
            />
          )

        case 'Slider':
          return (
            <Slider
              min={props.min}
              max={props.max}
              step={props.step}
              marks={props.marks}
              range={props.range}
              vertical={props.vertical}
              disabled={props.disabled}
              defaultValue={props.defaultValue}
            />
          )

        case 'Rate':
          return (
            <Rate
              count={props.count}
              allowHalf={props.allowHalf}
              allowClear={props.allowClear}
              disabled={props.disabled}
              defaultValue={props.defaultValue}
            />
          )

        case 'Statistic':
          return (
            <Statistic
              title={props.title}
              value={props.value}
              precision={props.precision}
              prefix={props.prefix}
              suffix={props.suffix}
              groupSeparator={props.groupSeparator}
            />
          )

        case 'Progress':
          return (
            <Progress
              percent={props.percent}
              type={props.type}
              status={props.status}
              showInfo={props.showInfo}
              size={props.size}
            />
          )

        case 'Badge':
          return (
            <Badge
              count={props.count}
              dot={props.dot}
              showZero={props.showZero}
              overflowCount={props.overflowCount}
              status={props.status}
            >
              <div style={{
                padding: '10px 20px',
                background: '#f0f0f0',
                borderRadius: '4px',
                display: 'inline-block'
              }}>
                {props.children || '徽标'}
              </div>
            </Badge>
          )

        case 'Tabs':
          // 如果有子组件，将子组件分配到标签页中
          const tabItems = React.Children.count(children) > 0
            ? React.Children.map(children, (child, index) => ({
                key: `tab-${index + 1}`,
                label: `标签页${index + 1}`,
                children: child
              })) || []
            : (Array.isArray(props.items) ? props.items : [
                { key: '1', label: '标签页1', children: '内容1' },
                { key: '2', label: '标签页2', children: '内容2' }
              ])

          return (
            <Tabs
              type={props.type}
              size={props.size}
              tabPosition={props.tabPosition}
              items={tabItems}
              style={{ minHeight: '200px', ...props.style }}
            />
          )

        case 'Collapse':
          // 如果有子组件，将子组件分配到折叠面板中
          const collapseItems = React.Children.count(children) > 0
            ? React.Children.map(children, (child, index) => ({
                key: `panel-${index + 1}`,
                label: `面板${index + 1}`,
                children: child
              })) || []
            : (Array.isArray(props.items) ? props.items : [
                { key: '1', label: '面板标题1', children: '面板内容1' },
                { key: '2', label: '面板标题2', children: '面板内容2' }
              ])

          return (
            <Collapse
              items={collapseItems}
              accordion={props.accordion}
              bordered={props.bordered}
              ghost={props.ghost}
              size={props.size}
              style={{ minHeight: '200px', ...props.style }}
            />
          )

        // 业务组件
        case 'UserProfile':
          return (
            <Card style={{ width: 300 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <Avatar size={64} src={props.avatar} style={{ marginRight: 16 }} />
                <div>
                  <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
                    {props.name}
                  </div>
                  <div style={{ color: '#666', fontSize: 14 }}>
                    {props.title}
                  </div>
                </div>
              </div>
              <div style={{ color: '#999', fontSize: 14 }}>
                {props.description}
              </div>
            </Card>
          )

        case 'StatsCard':
          const getTrendIcon = (trend: string) => {
            if (trend === 'up') return <ArrowUpOutlined style={{ color: '#52c41a' }} />
            if (trend === 'down') return <ArrowDownOutlined style={{ color: '#f5222d' }} />
            return null
          }
          const getTrendColor = (trend: string) => {
            if (trend === 'up') return '#52c41a'
            if (trend === 'down') return '#f5222d'
            return '#666'
          }

          return (
            <Card style={{ width: 240 }}>
              <div style={{ marginBottom: 8, color: '#666', fontSize: 14 }}>
                {props.title}
              </div>
              <div style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
                {props.prefix}{props.value}{props.suffix}
              </div>
              {props.trend !== 'none' && (
                <div style={{ display: 'flex', alignItems: 'center', fontSize: 12 }}>
                  {getTrendIcon(props.trend)}
                  <span style={{ marginLeft: 4, color: getTrendColor(props.trend) }}>
                    {props.trendValue}%
                  </span>
                </div>
              )}
            </Card>
          )

        case 'ProductCard':
          return (
            <Card
              hoverable
              style={{ width: 240 }}
              cover={<img alt={props.title} src={props.image} style={{ height: 160, objectFit: 'cover' }} />}
            >
              <div style={{ marginBottom: 8, fontSize: 16, fontWeight: 'bold' }}>
                {props.title}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ color: '#f5222d', fontSize: 18, fontWeight: 'bold' }}>
                  ¥{props.price}
                </span>
                {props.originalPrice && (
                  <span style={{
                    marginLeft: 8,
                    color: '#999',
                    fontSize: 14,
                    textDecoration: 'line-through'
                  }}>
                    ¥{props.originalPrice}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666' }}>
                <span>⭐ {props.rating}</span>
                <span>销量 {props.sales}</span>
              </div>
            </Card>
          )

        case 'TimelineItem':
          const getStatusColor = (status: string) => {
            switch (status) {
              case 'success': return 'green'
              case 'processing': return 'blue'
              case 'warning': return 'orange'
              case 'error': return 'red'
              default: return 'gray'
            }
          }

          return (
            <Timeline>
              <Timeline.Item color={getStatusColor(props.status)}>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: 16, fontWeight: 'bold' }}>{props.title}</span>
                  <span style={{ marginLeft: 8, color: '#666', fontSize: 12 }}>{props.time}</span>
                </div>
                <div style={{ color: '#666', fontSize: 14 }}>
                  {props.description}
                </div>
              </Timeline.Item>
            </Timeline>
          )

        case 'ContactInfo':
          return (
            <Card title="联系方式" style={{ width: 300 }}>
              <div style={{ lineHeight: '32px' }}>
                {props.phone && (
                  <div style={{ marginBottom: 8 }}>
                    <PhoneOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                    {props.phone}
                  </div>
                )}
                {props.email && (
                  <div style={{ marginBottom: 8 }}>
                    <MailOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                    {props.email}
                  </div>
                )}
                {props.address && (
                  <div style={{ marginBottom: 8 }}>
                    <EnvironmentOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                    {props.address}
                  </div>
                )}
                {props.website && (
                  <div style={{ marginBottom: 8 }}>
                    <GlobalOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                    <a href={props.website} target="_blank" rel="noopener noreferrer">
                      {props.website}
                    </a>
                  </div>
                )}
              </div>
            </Card>
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
  const isInputComponent = [
    'Input', 'TextArea', 'Select', 'DatePicker', 'Button',
    'Text', 'Title', 'Image', 'Divider', 'Tag', 'Checkbox',
    'Radio', 'Switch', 'Slider', 'Rate', 'Progress', 'Badge'
  ].includes(type)

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
