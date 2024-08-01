---
title: 组合使用
order: 6
---

## 基本使用

1. 此为一个简单的筛选列表+tab示例，此数据为文档展示写死的mock数据，故为展示分页，正常使用时不受任何影响
2. 可以【Network】查看请求差异
3. 默认会江筛选项数据更新为query参数
4. 可以通过右上角的 ☕️咖啡 图标，进行筛选保存，筛选后，点击咖啡图标保存试试，然后清除筛选，再从咖啡图标的缓存进入试试，同样这些操作都是会缓存到localstorage（默认：30天）


```tsx
import {
  FormItemInput,
  FormItemSelect,
  Badge,
  TableRowButton,
  PageListQuery,
  CardTabs,
} from '@fundam/antd'
import { DesktopOutlined, MobileOutlined } from '@ant-design/icons'
import { Tag } from 'antd'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'

// 仅文档展示使用
import { MockContainer, ShowCode } from '../index'

export default () => {
  const tableRef = useRef(null)
  const formRef1 = useRef(null)
  const formRef2 = useRef(null)
  const navigate = useNavigate()
  const [selectedData, setSelectedData] = useState<any>([])
  const onClickRecordName = (record: any) => {
    console.log(record)
  }

  // 选中rowKeys（跨页多选） - 可以重写rowSelection props替换掉TablePro原逻辑
  const tableOnSelectedRowKeysChange = (selectKeys: Array<any>) => {
    console.log(selectKeys)
    setSelectedData(selectKeys)
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
        rowCol={8}
        dataApiReqData={{
          page: 1,
          pageSize: 200
        }}
      />
      <FormItemInput
        name="name"
        rowCol={8}
        label="活动名称"
      />
    </>
  )

  return (
    <MockContainer>
      <PageListQuery
        formRef={formRef1}
        // 当只有一两个筛选项时可以直接放到卡片左上角展示
        formInTableCardTitle
        formItems={formItem}
        parseQueryKeys={['page', 'pageSize', 'id']}
        tableProps={{
          rowKey: 'id',
          columns: columns as any,
          dataApi: '/resource/getList.json',
          dataApiReqData: {
            status: 1
          },
          onSelectedRowKeysChange: tableOnSelectedRowKeysChange
        }}
        tableCardProps={{
          style: {
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
          }
        }}
      />
    </MockContainer>
  )
}
```

