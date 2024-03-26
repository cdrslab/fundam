import {
  // FormItemDatePickerRangePicker,
  FormItemInput,
  FormItemSelect,
  // FormItemCascade,
  Badge,
  TableRowButton,
  ListFilter,
  CardTabs,
} from '@fundam/antd'
import { DesktopOutlined, MobileOutlined } from '@ant-design/icons'
import { Button, Tag } from 'antd'
// import './index.less'

// const resourceStatusOptions = [
//   {
//     label: '待发布',
//     value: 1,
//   },
//   {
//     label: '未开始',
//     value: 2,
//   },
//   {
//     label: '进行中',
//     value: 3,
//   },
//   {
//     label: '已结束',
//     value: 4,
//   },
// ]

export default () => {
  // const [selectedData, setSelectedData] = useState<any>([])
  const onClickRecordName = (record: any) => {
    console.log(record)
  }

  // 选中rowKeys（跨页多选） - 可以重写rowSelection props替换掉TablePro原逻辑
  // const tableOnSelectedRowKeysChange = (selectKeys: Array<any>) => {
  //   console.log(selectKeys)
  //   setSelectedData(selectKeys)
  // }

  // 选中rowRecords（跨页多选）
  // const tableOnSelectedRowRecordsChange = (selectRecords: Array<any>) => {
  //   setSelectedData(selectRecords)
  // }

  // const exportSelectedData = () => {
  //   console.log(selectedData)
  //   message.success('Test....')
  // }

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

  const formItem = (
    <>
      <FormItemSelect
        // mode="multiple"
        name="id"
        label="远程搜索"
        dataApi="/api/resource/list"
        resDataPath="list"
        labelKey="name"
        valueKey="id"
        searchKey="name"
        // maxTagCount="responsive"
        dataApiReqData={{
          page: 1,
          pageSize: 200
        }}
      />
      <FormItemInput
        name="name"
        label="活动名称"
      />
      {/*<FormItemCascade*/}
      {/*  changeOnSelect*/}
      {/*  // name="type"*/}
      {/*  names={['deviceTyoe', 'type']}*/}
      {/*  label="资源类型"*/}
      {/*  labelKey="title"*/}
      {/*  valueKey="code"*/}
      {/*  childrenKey="sub"*/}
      {/*  dataApi="/api/resource/type"*/}
      {/*/>*/}
      {/*<FormItemCascade*/}
      {/*  changeOnSelect*/}
      {/*  // name="type"*/}
      {/*  names={['province', 'city', 'district']}*/}
      {/*  label="loadData"*/}
      {/*  loadDataKey="id"*/}
      {/*  loadDataMaxLayer={3}*/}
      {/*  dataApiReqData={{*/}
      {/*    id: '-1'*/}
      {/*  }}*/}
      {/*  dataApi="/api/location/listById"*/}
      {/*/>*/}
      {/*<FormItemSelect*/}
      {/*  name="status"*/}
      {/*  label="状态"*/}
      {/*  options={resourceStatusOptions}*/}
      {/*/>*/}
      {/*<FormItemDatePickerRangePicker*/}
      {/*  rowCol={12}*/}
      {/*  names={['start', 'end']}*/}
      {/*  label="活动时间"*/}
      {/*/>*/}
    </>
  )

  const items = [
    {
      label: 'tab1',
      key: 'tab1',
      children: (
        <ListFilter
          formInCardTitle
          formItems={formItem}
          queryToNumber={['province', 'city', 'district', 'page', 'pageSize', 'status', 'id']}
          tableCacheKey="resourceTablePro"
          tableColumns={columns}
          tableDataApi="/api/resource/list"
          tableExtra={<><Button onClick={() => {}} type="primary">导出</Button></>}
        />
      )
    },
    {
      label: 'tab2',
      key: 'tab2',
      children: (
        <ListFilter
          formInCardTitle
          formItems={formItem}
          queryToNumber={['province', 'city', 'district', 'page', 'pageSize', 'status', 'id']}
          tableCacheKey="resourceTablePro"
          tableColumns={columns}
          tableDataApi="/api/resource/list"
          tableExtra={<><Button onClick={() => {}} type="primary">导出</Button></>}
        />
      )
    },
  ]

  return (
    <div className="fun-list-pro-2">
      <CardTabs
        defaultActiveKey="tab1"
        items={items}
        type="card"
      />
    </div>
  )
}
