import { useRef } from 'react'
import { Button } from 'antd'
import { PageListQuery, FormItemInput, FormItemDatePickerRangePicker, TableRowButton } from '@fundam/antd'

export default () => {
  const tableRef = useRef(null)

  const formItems = [
    <FormItemInput name="word" label="字" />,
    <FormItemInput name="createdId" label="创建人" />,
    <FormItemInput name="updatedId" label="更新人" />,
    <FormItemDatePickerRangePicker names={['createStart', 'createEnd']} label="创建时间" />,
    <FormItemDatePickerRangePicker names={['updateStart', 'updateEnd']} label="更新时间" />
  ]

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 50 },
    { title: '字', dataIndex: 'word', width: 100 },
    { title: '词', dataIndex: 'phrase', width: 100 },
    { title: '句', dataIndex: 'sentence', width: 200 },
    { title: '拼音', dataIndex: 'pinyin', width: 100 },
    { title: '笔画', dataIndex: 'strokes', width: 100 },
    { title: '更新人', dataIndex: 'updatedUser', width: 100 },
    { title: '更新时间', dataIndex: 'updatedTime', width: 150 },
    { title: '创建人', dataIndex: 'createdUser', width: 100 },
    { title: '创建时间', dataIndex: 'createdTime', width: 150 },
    {
      title: '操作', dataIndex: 'op', width: 150,
      render: (_: any, record: any) => (
        <>
          <TableRowButton onClick={() => console.log(record)}>查看</TableRowButton>
          <TableRowButton onClick={() => console.log(record)}>编辑</TableRowButton>
          <TableRowButton danger onClick={() => console.log(record)}>删除</TableRowButton>
        </>
      )
    }
  ]

  return (
    <PageListQuery
      tableRef={tableRef}
      formItems={formItems}
      parseQueryKeys={['word', 'createdId', 'updatedId', 'createStart', 'createEnd', 'updateStart', 'updateEnd']}
      tableProps={{
        rowKey: 'id',
        columns: columns as any,
        dataApi: '/api/char/list'
      }}
      tableCardProps={{
        title: (
          <>
            <Button type="primary" onClick={() => console.log('新增')} style={{marginRight: 8}}>新建字</Button>
            <Button onClick={() => console.log('导入数据')} style={{marginRight: 8}}>导入数据</Button>
            <Button onClick={() => console.log('导出数据')} style={{marginRight: 8}}>导出数据</Button>
            <Button onClick={() => console.log('批量导入资源文件')} style={{marginRight: 8}}>批量导入资源文件</Button>
            <Button onClick={() => console.log('下载数据导入模板')} style={{marginRight: 8}}>下载数据导入模板</Button>
          </>
        )
      }}
    />
  )
}
