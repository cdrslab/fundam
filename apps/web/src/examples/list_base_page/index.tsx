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
  Table
} from '@fundam/antd'

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

  const onReset = () => {
    form.resetFields()
  }

  const onSubmit = () => {
    form.submit()
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
      width: 150
    },
    {
      title: '资源类型',
      dataIndex: 'typeDesc',
      width: 220
    },
    {
      title: '投放时间',
      dataIndex: 'time',
      width: 150
    },
    {
      title: '状态',
      dataIndex: 'statusDesc',
      width: 80
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
      width: 150
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
          defaultButtonClick={onReset}
          primaryButtonText="查询"
          primaryButtonClick={onSubmit}
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
          columns={columns}
        />
      </Card>
    </div>
  )
}
