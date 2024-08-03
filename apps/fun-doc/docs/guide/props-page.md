---
title: Page
order: 11
---

# PageListQuery

## 描述

带筛选的列表页面、组件，默认会将页面数据、筛选项同步更新到query

## 导入

```ts
import { PageListQuery } from '@fundam/antd'
```

## 使用示例

```tsx | pure
import {
  FormItemInput,
  FormItemSelect,
  Badge,
  TableRowButton,
  PageListQuery,
  FormItemDatePickerRangePicker,
  ModalForm,
  FormItemRadio,
  useModal
} from '@fundam/antd'
import { DesktopOutlined, MobileOutlined } from '@ant-design/icons'
import { Tag, Button } from 'antd'
import { useState } from 'react'

export default () => {
  const { open, openModal, closeModal } = useModal()
  const [manualInput, setManualInput] = useState<boolean>(false)
  
  const onClickRecordName = (record: any) => {
    console.log(record)
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 120,
      onCopy: (record: any) => record.id
    },
    {
      title: '名称',
      dataIndex: 'name',
      width: 130,
      tooltip: 'Test',
      onClick: onClickRecordName
    },
    {
      title: '资源类型',
      dataIndex: 'typeDesc',
      width: 140,
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
      width: 380,
      maxLine: 3,
      onCopy: (record: any) => record.time
    },
    {
      title: '状态',
      dataIndex: 'statusDesc',
      width: 100,
      render: (_: any, record: any) => <Badge status={['warning', 'processing', 'success', 'default'][record.status - 1] as any} text={record.statusDesc} />
    },
    {
      title: '创建人',
      dataIndex: 'createUser',
      width: 140,
      render: (_: any, record: any) => <Tag color={record.createUser.length > 2 ? 'geekblue' : 'volcano'} key={record.createUser}>{record.createUser}</Tag>,
      onCopy: (record: any) => record.createUserId
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 220
    },
    {
      title: '操作',
      dataIndex: 'op',
      width: 150,
      fixed: 'right',
      render: (_: any, record: any) => (
        <>
          <TableRowButton onClick={async () => {
            formRef.current?.reset()
          }}>复制</TableRowButton>
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

  const formItem = (
    <>
      <FormItemSelect
        name="id"
        label="远程搜索"
        dataApi="/resource/getList.json"
        resDataPath="list"
        labelKey="name"
        valueKey="id"
        searchKey="name"
        dataApiReqData={{
          page: 1,
          pageSize: 200
        }}
      />
      <FormItemInput
        name="name"
        label="活动名称"
      />
      <FormItemDatePickerRangePicker
        rowCol={12}
        names={['start', 'end']}
        label="时间范围"
      />
    </>
  )

  return (
    <>
      <PageListQuery
        formItems={formItem}
        // 可以根据下面的key把query的字段格式化为数字、布尔等，用于筛选的回显和数据提交
        parseQueryKeys={['page', 'pageSize', 'id']}
        tableProps={{
          rowKey: 'id',
          columns: columns as any,
          dataApi: '/resource/getList.json',
          dataApiReqData: {
            status: 1
          },
        }}
        tableCardProps={{
          title: <Button type="primary" onClick={openModal} style={{marginRight: 16}}>新增</Button>
        }}
        formProps={{
          collapseNames: ['name']
        }}
      />
      <ModalForm
        open={open}
        title="新增"
        closeModal={closeModal}
        onSuccess={() => {}}
        // 弹窗表单确认后调用接口
        dataApi="/postMock.json"
        formProps={{
          labelCol: { span: 6 }
        }}
      >
        <FormItemSelect
          required
          needInitFetch={false}
          name='userId'
          label='用户'
          labelKey="name"
          valueKey="id"
          dataApi="/user/getList.json"
          resDataPath="list"
          searchKey="name"
          help={(
            <span>未查询到<a onClick={() => { setManualInput(true) }}>手动输入</a></span>
          )}
          dataApiReqData={{
            pageNo: 1,
            pageSize: 100
          }}
          visibleRule={!manualInput}
        />
        <FormItemInput
          required
          name="name"
          label="名称"
          visibleRule={manualInput}
          help={<span>返回<a onClick={() => setManualInput(!manualInput)}> 选择用户 </a>补充</span>}
        />
        <FormItemRadio
          required
          name="gender"
          label="性别"
          options={[
            {
              label: '男',
              value: 1
            },
            {
              label: '女',
              value: 2
            },
          ]}
        />
        <FormItemInput
          required
          name="address"
          label="详细地址"
        />
      </ModalForm>
    </>
  )
}
```

## Props

| 属性               | 是否必须 | 类型                         | 默认值          | 描述                                                                              |
|------------------|------|----------------------------|--------------|---------------------------------------------------------------------------------|
| formItems           | 是    | React.ReactNode            | -            | Fundam的"FormItem"开头的组件或者Antd的Form.Item                                          |
| cacheKey           | 否    | string                     | -            | 缓存key，默认用当前页面的path作为key                                                         |
| tableProps           | 否    | ProTableProps              | -            | Fundam的ProTable对应的props对象                                                       |
| formRef           | 否    | RefObject                  | -            | 允许通过formRef操作筛选表单，如：formRef.current.reset()                                     |
| tableRef           | 否    | RefObject                  | -            | 允许通过tableRef操作表格，如：tableRef.current.refresh()、tableRef.current.fetch(params)    |
| formProps           | 否    | FormProps                  | -            | Fundam的Form对应的props对象，这里是控制筛选表单Form                                             |
| formCardProps           | 否    | CardProps                  | -            | Form默认会用Card组件包裹，本属性用于控制Card，与Antd Card props一致，如：{ title: '筛选' }               |
| formCardFooter           | 否    | React.ReactNode            | -            | 在筛选卡片里面的Form下面插入自定义内容                                                           |
| tableCardProps           | 否    | CardProps                  | -            | Table默认会用Card组件包裹，本属性用于控制Card，与Antd Card props一致，如：{ title: '列表' }              |
| parseQueryKeys           | 否    | Array<string>              | -            | 需要parse的query key，可以根据此属性把query的字段格式化为数字、布尔等，用于筛选表单根据query的回显和数据提交              |
| parseArrayKeys           | 否    | Array<string>              | -            | 需要在列表请求前格式化为数组的key，筛选包含多选的下拉框、级联并且更新query时（默认更新query），需要设置此属性，默认多选的query用英文逗号分割 |
| formInTableCardTitle           | 否    | boolean                    | false        | 将筛选表单插入table card的左侧标题处，筛选表单项超过三个请不要设置此属性，会换行                                   |
| formUseFormItemBorder           | 否    | boolean                    | false        | 给每个FormItem都套上一个样式边框                                                            |
| formDirection           | 否    | 'horizontal' \| 'vertical' | 'horizontal' | 筛选表单排列方式                                                                        |
| formShowValidateMessagesRow           | 否    | boolean                    | false        | 是否需要展示校验信息占位，默认不需要，筛选表单通常不需要展示校验信息，也不需要前端校验                                     |
| formDefaultButtonText           | 否    | string                     | '重置'         | 次按钮文案                                                                           |
| formPrimaryButtonText           | 否    | string                     | '查询'         | 主按钮文案                                                                           |
| tableRowKey           | 否    | string                     | 'id'         | Table行的唯一key                                                                    |
| tablePageKey           | 否    | string                     | 'page'       | 接口响应数据的页码参数key                                                                  |
| tablePageSizeKey           | 否    | string                     | 'pageSize'   | 接口响应数据的没有大小参数key                                                                |
| defaultPageSize           | 否    | number                     | 20           | 默认请求服务端每页20条数据                                                                  |
