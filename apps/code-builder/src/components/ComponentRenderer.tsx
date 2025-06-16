import React from 'react'
import {
  Button,
  Input,
  Card,
  Space,
  Form,
  Table,
  Modal,
  Alert,
  Typography,
  Select,
  DatePicker,
  Row,
  Col,
  Divider,
  Tabs,
  Collapse
} from 'antd'
import type { ComponentConfig, GlobalConfig } from '../types'

// 模拟Fundam组件（实际项目中应该从@fundam/antd导入）
const PageListQuery = (props: any) => (
  <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, padding: 16 }}>
    <div style={{ marginBottom: 16, padding: 16, background: '#fafafa', borderRadius: 4 }}>
      <Typography.Title level={5} style={{ margin: 0, marginBottom: 8 }}>查询条件</Typography.Title>
      <Space>
        <Input placeholder="请输入用户名" style={{ width: 200 }} />
        <Select placeholder="请选择状态" style={{ width: 120 }}>
          <Select.Option value="active">启用</Select.Option>
          <Select.Option value="inactive">禁用</Select.Option>
        </Select>
        <Button type="primary">查询</Button>
        <Button>重置</Button>
      </Space>
    </div>
    <Table 
      columns={[
        { title: 'ID', dataIndex: 'id', key: 'id' },
        { title: '用户名', dataIndex: 'username', key: 'username' },
        { title: '状态', dataIndex: 'status', key: 'status' },
        { title: '操作', key: 'action', render: () => <Space><Button size="small">编辑</Button><Button size="small" danger>删除</Button></Space> }
      ]}
      dataSource={[
        { id: 1, username: '用户1', status: '启用' },
        { id: 2, username: '用户2', status: '禁用' }
      ]}
      pagination={{ pageSize: 10 }}
      {...props}
    />
  </div>
)

const FormItemInput = (props: any) => (
  <Form.Item label={props.label || '输入框'} name={props.name || 'input'}>
    <Input placeholder={props.placeholder || '请输入'} {...props} />
  </Form.Item>
)

const FormItemSelect = (props: any) => (
  <Form.Item label={props.label || '下拉选择'} name={props.name || 'select'}>
    <Select placeholder={props.placeholder || '请选择'} {...props}>
      <Select.Option value="option1">选项1</Select.Option>
      <Select.Option value="option2">选项2</Select.Option>
    </Select>
  </Form.Item>
)

const ModalForm = (props: any) => (
  <Modal 
    title={props.title || '表单'}
    open={props.visible || true}
    onOk={() => {}}
    onCancel={() => {}}
    {...props}
  >
    <Form layout="vertical">
      <FormItemInput label="示例输入" />
      <FormItemSelect label="示例选择" />
    </Form>
  </Modal>
)

const ProTable = (props: any) => (
  <Table 
    columns={props.columns || [
      { title: '列1', dataIndex: 'col1', key: 'col1' },
      { title: '列2', dataIndex: 'col2', key: 'col2' }
    ]}
    dataSource={props.dataSource || [
      { col1: '数据1', col2: '数据2' }
    ]}
    {...props}
  />
)

const { Title, Text } = Typography
const { TextArea } = Input

interface ComponentRendererProps {
  component: ComponentConfig
  allComponents: ComponentConfig[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  globalConfig: GlobalConfig
  children?: React.ReactNode
}

const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  component,
  allComponents,
  selectedId,
  onSelect,
  globalConfig,
  children
}) => {
  const { identity, props, isVisible } = component
  const isSelected = selectedId === identity.id

  // 如果组件不可见且不是选中状态，则不渲染
  if (!isVisible && !isSelected) {
    return null
  }

  // 处理组件点击事件
  const handleComponentClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect(identity.id)
  }

  // 渲染子组件
  const renderChildren = () => {
    if (children) {
      return children
    }

    // 找出当前组件的子组件
    const childComponents = allComponents.filter(comp => comp.identity.parentId === identity.id)

    return childComponents.map(childComp => (
      <ComponentRenderer
        key={childComp.identity.id}
        component={childComp}
        allComponents={allComponents}
        selectedId={selectedId}
        onSelect={onSelect}
        globalConfig={globalConfig}
      />
    ))
  }

  // 包装组件以添加选择状态
  const wrapWithSelection = (component: React.ReactNode) => {
    return (
      <div
        onClick={handleComponentClick}
        style={{
          position: 'relative',
          border: isSelected ? '2px solid #1890ff' : '2px solid transparent',
          borderRadius: '4px',
          padding: isSelected ? '4px' : '6px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          background: isSelected ? 'rgba(24, 144, 255, 0.05)' : 'transparent'
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.border = '2px dashed #1890ff'
            e.currentTarget.style.background = 'rgba(24, 144, 255, 0.02)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.border = '2px solid transparent'
            e.currentTarget.style.background = 'transparent'
          }
        }}
      >
        {component}
        {isSelected && (
          <div
            style={{
              position: 'absolute',
              top: '-8px',
              left: '8px',
              background: '#1890ff',
              color: 'white',
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '2px',
              zIndex: 10
            }}
          >
            {identity.name}
          </div>
        )}
      </div>
    )
  }

  // 渲染具体的组件
  const renderComponent = () => {
    try {
      switch (identity.type) {
        case 'PageListQuery':
          return renderPageListQuery()

        case 'FormItemInput':
          return renderFormItemInput()

        case 'FormItemSelect':
          return renderFormItemSelect()

        case 'Button':
          return renderButton()

        case 'Modal':
        case 'ModalForm':
          return renderModal()

        case 'Form':
          return renderForm()

        case 'Table':
        case 'ProTable':
          return renderTable()

        case 'Card':
          return renderCard()

        case 'Tabs':
          return renderTabs()

        case 'Collapse':
          return renderCollapse()

        case 'Input':
          return <Input {...props} />

        case 'TextArea':
          return <TextArea {...props} />

        case 'Select':
          return renderSelect()

        case 'DatePicker':
          return <DatePicker {...props} />

        case 'Space':
          return (
            <Space {...props}>
              {renderChildren()}
            </Space>
          )

        case 'Row':
          return (
            <Row {...props}>
              {renderChildren()}
            </Row>
          )

        case 'Col':
          return (
            <Col {...props}>
              {renderChildren()}
            </Col>
          )

        case 'Divider':
          return <Divider {...props}>{props.children}</Divider>

        case 'Title':
          return <Title level={props.level || 1} {...props}>{props.children || '标题'}</Title>

        case 'Text':
          return <Text {...props}>{props.children || '文本'}</Text>

        default:
          return (
            <Alert
              message="未知组件"
              description={`组件类型 "${identity.type}" 暂不支持预览`}
              type="warning"
              style={{ margin: '8px 0' }}
            />
          )
      }
    } catch (error) {
      return (
        <Alert
          message="组件渲染错误"
          description={`组件 "${identity.name}" 渲染失败: ${error instanceof Error ? error.message : '未知错误'}`}
          type="error"
          style={{ margin: '8px 0' }}
        />
      )
    }
  }

  // 具体组件渲染方法
  const renderPageListQuery = () => {
    return (
      <PageListQuery
        {...props}
        formItems={props.formItems || (
          <>
            <FormItemInput name="search" label="搜索" placeholder="请输入搜索关键词" />
          </>
        )}
        tableProps={{
          columns: props.tableProps?.columns || [
            { title: 'ID', dataIndex: 'id', key: 'id' },
            { title: '名称', dataIndex: 'name', key: 'name' }
          ],
          dataSource: props.tableProps?.dataSource || [
            { key: '1', id: 1, name: '示例数据1' },
            { key: '2', id: 2, name: '示例数据2' }
          ],
          ...props.tableProps
        }}
      />
    )
  }

  const renderFormItemInput = () => {
    return (
      <FormItemInput
        name={props.name || 'input'}
        label={props.label || '输入框'}
        placeholder={props.placeholder || `请输入${props.label || '内容'}`}
        required={props.required}
        {...props}
      />
    )
  }

  const renderFormItemSelect = () => {
    return (
      <FormItemSelect
        name={props.name || 'select'}
        label={props.label || '选择器'}
        placeholder={props.placeholder || `请选择${props.label || '选项'}`}
        options={props.options || [
          { label: '选项1', value: 'option1' },
          { label: '选项2', value: 'option2' }
        ]}
        required={props.required}
        {...props}
      />
    )
  }

  const renderButton = () => {
    return (
      <Button
        type={props.type || 'default'}
        size={props.size || 'middle'}
        danger={props.danger}
        loading={props.loading}
        disabled={props.disabled}
        {...props}
        onClick={(e) => {
          handleComponentClick(e)
          // 执行按钮的原始点击事件
          if (props.onClick) {
            props.onClick(e)
          }
        }}
      >
        {props.children || props.title || '按钮'}
      </Button>
    )
  }

  const renderModal = () => {
    // 对于Modal组件，需要特殊处理以便在预览中显示
    const modalProps = {
      ...props,
      open: isSelected ? true : (props.open || props.visible), // 选中时强制显示
      getContainer: false, // 防止Modal渲染到body外部
      style: { position: 'relative' } // 相对定位以便在预览中显示
    }

    if (identity.type === 'ModalForm') {
      return (
        <ModalForm
          {...modalProps}
          title={props.title || '弹窗表单'}
        >
          {renderChildren()}
        </ModalForm>
      )
    }

    return (
      <Modal
        {...modalProps}
        title={props.title || '弹窗'}
      >
        {renderChildren()}
      </Modal>
    )
  }

  const renderForm = () => {
    return (
      <Form
        layout={props.layout || 'vertical'}
        size={props.size || 'middle'}
        {...props}
      >
        {renderChildren() || (
          <Form.Item label="示例字段" name="example">
            <Input placeholder="这是一个示例表单项" />
          </Form.Item>
        )}
      </Form>
    )
  }

  const renderTable = () => {
    const tableProps = {
      columns: props.columns || [
        { title: 'ID', dataIndex: 'id', key: 'id' },
        { title: '名称', dataIndex: 'name', key: 'name' },
        {
          title: '操作',
          key: 'action',
          render: () => (
            <Space>
              <Button size="small" type="link">编辑</Button>
              <Button size="small" type="link" danger>删除</Button>
            </Space>
          )
        }
      ],
      dataSource: props.dataSource || [
        { key: '1', id: 1, name: '示例数据1' },
        { key: '2', id: 2, name: '示例数据2' }
      ],
      pagination: props.pagination !== false ? { pageSize: 10, ...props.pagination } : false,
      ...props
    }

    if (identity.type === 'ProTable') {
      return <ProTable {...tableProps} />
    }

    return <Table {...tableProps} />
  }

  const renderCard = () => {
    return (
      <Card
        title={props.title || '卡片标题'}
        size={props.size || 'default'}
        {...props}
      >
        {renderChildren() || (
          <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
            卡片内容
          </div>
        )}
      </Card>
    )
  }

  const renderTabs = () => {
    const items = props.items || [
      {
        key: '1',
        label: '标签页1',
        children: renderChildren() || <div style={{ padding: 16 }}>标签页1内容</div>
      },
      {
        key: '2',
        label: '标签页2',
        children: <div style={{ padding: 16 }}>标签页2内容</div>
      }
    ]

    return (
      <Tabs
        type={props.type}
        size={props.size}
        tabPosition={props.tabPosition}
        items={items}
        {...props}
      />
    )
  }

  const renderCollapse = () => {
    const items = props.items || [
      {
        key: '1',
        label: '面板1',
        children: renderChildren() || <div style={{ padding: 16 }}>面板1内容</div>
      },
      {
        key: '2',
        label: '面板2',
        children: <div style={{ padding: 16 }}>面板2内容</div>
      }
    ]

    return (
      <Collapse
        accordion={props.accordion}
        bordered={props.bordered}
        ghost={props.ghost}
        size={props.size}
        items={items}
        {...props}
      />
    )
  }

  const renderSelect = () => {
    const options = props.options || [
      { label: '选项1', value: 'option1' },
      { label: '选项2', value: 'option2' }
    ]

    return (
      <Select
        placeholder={props.placeholder || '请选择'}
        style={{ minWidth: 120, ...props.style }}
        {...props}
      >
        {options.map((option, index) => (
          <Select.Option key={index} value={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select>
    )
  }

  // 组件容器样式
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    cursor: 'pointer',
    borderRadius: 4,
    transition: 'all 0.2s ease',
    // 选中状态的样式
    ...(isSelected ? {
      outline: '2px solid #1890ff',
      outlineOffset: 2,
      backgroundColor: 'rgba(24, 144, 255, 0.05)'
    } : {}),
    // 不可见组件的样式
    ...(!isVisible ? {
      opacity: 0.5,
      border: '1px dashed #d9d9d9'
    } : {})
  }

  return wrapWithSelection(renderComponent())
}

export default ComponentRenderer
