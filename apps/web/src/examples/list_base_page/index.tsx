import { useEffect, useState } from 'react'
import {
  Card,
  Title,
  Space,
  Form,
  FormItemUploadImage,
  FormItemDatePickerRangePicker,
  FormItemInput,
  FormItemSelect,
  FormItemRadio,
  useAntFormInstance,
  FormItemCheckbox,
  FormItemCascade,
  FormDisplayType,
  FunFormInstance,
  FormItemTextArea,
  Table,
  Badge, useAlias, TableRowButton
} from '@fundam/antd'
import { DesktopOutlined, MobileOutlined } from '@ant-design/icons';

const resourceStatusOptions = [
  {
    label: '待发布',
    value: '1',
  },
  {
    label: '未开始',
    value: '2',
  },
  {
    label: '进行中',
    value: '3',
  },
  {
    label: '已结束',
    value: '4',
  },
]

export default () => {
  const [form] = useAntFormInstance()
  const { resourceTable } = useAlias()

  const onClickRecordName = (record: any) => {
    console.log(record)
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
    },
    {
      title: '名称',
      dataIndex: 'name',
      width: 130,
      onClick: onClickRecordName
    },
    {
      title: '资源类型',
      dataIndex: 'typeDesc',
      width: 120,
      render: (_: any, record: any) => (
        <span>
          {
            record.type[0] === 'APP' ?
              <MobileOutlined style={{ color: 'red', marginRight: 4}} />
              :
              <DesktopOutlined style={{color: 'red', marginRight: 4}} />
          }
          {record.typeDesc}
        </span>
      )
    },
    {
      title: '投放时间',
      dataIndex: 'time',
      width: 320
    },
    {
      title: '状态',
      dataIndex: 'statusDesc',
      width: 80,
      render: (_: any, record: any) => <Badge status={['warning', 'processing', 'success', 'default'][record.status - 1] as any} text={record.statusDesc} />
    },
    {
      title: '创建人',
      dataIndex: 'createUser',
      width: 80
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 160
    },
    {
      title: '操作',
      dataIndex: 'op',
      width: 150,
      render: (_: any, record: any) => (
        <>
          <TableRowButton onClick={() => console.log(record)}>查看</TableRowButton>
          <TableRowButton onClick={() => console.log(record)}>复制</TableRowButton>
          {
            record.status < 4 ? <TableRowButton onClick={() => console.log(record)}>编辑</TableRowButton> : null
          }
          {
            record.status === 3 ? <TableRowButton onClick={() => console.log(record)} danger>下线</TableRowButton> : null
          }
        </>
      )
    },
  ]

  return (
    <div className="fun-page">
      <Card style={{ marginBottom: 24 }}>
        <Form
          form={form}
          direction="horizontal"
          showValidateMessagesRow={false}
          defaultButtonText="重置"
          defaultButtonClick={() => { form.resetFields(); resourceTable.fetchData({ page: 1 }) }}
          primaryButtonText="查询"
          primaryButtonClick={() => form.submit()}
          onFinish={(values) => resourceTable.fetchData({ ...values, page: 1 })}
        >
          <FormItemInput
            isNumber
            name="id"
            label="投放ID"
          />
          <FormItemInput
            name="name"
            label="活动名称"
          />
          <FormItemCascade
            name="type"
            label="资源类型"
            labelKey="title"
            valueKey="code"
            childrenKey="sub"
            dataApi="/api/resource/type"
          />
          <FormItemSelect
            name="status"
            label="状态"
            options={resourceStatusOptions}
          />
          <FormItemDatePickerRangePicker
            rowCol={12}
            names={['start', 'end']}
            label="活动时间"
          />
        </Form>
      </Card>
      <Card title="资源列表">
        <Table
          alias="resourceTable"
          columns={columns}
          dataApi="/api/resource/list"
          rowKey="id"
        />
      </Card>
    </div>
  )
}
