---
title: 表格场景
order: 4
---

## 简单使用

1. 拖拽下面列的边框调整下列宽度试试，刷新依然会保留
2. 可以使用`onClick`、`onCopy`、`tooltip`等轻松实现一些简易的交互功能
3. 这里mock数据因为是写死的json，所以不做分页示例了，分页也非常简单，Fundam会自动根据total计算得出分页组件的展示，当然也可以非常方便的设置分页相关属性，例如：`pageKey`、`pageSizeKey`、`listKey`、`totalKey`、`emptyValue`等

```tsx
import { useState } from 'react'
import {
  Form,
  ProTable
} from '@fundam/antd'
import { message } from 'antd'

// 仅文档展示使用
import { MockContainer, ShowCode } from '../index'

export default () => {
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 140,
      onClick: (record: any) => {
        message.info('点击：' + record.id)
      }
    },
    {
      title: '名称',
      dataIndex: 'name',
      width: 140,
      tooltip: '这是个tooltip'
    },
    {
      title: '账号',
      dataIndex: 'account',
      width: 140,
    },
    {
      title: '手机号',
      dataIndex: 'mobile',
      width: 140,
      onCopy: (record: any) => record.mobile,
    },
    {
      title: '操作',
      dataIndex: 'op',
      width: 140,
      render: (_: string, record: any) => <a onClick={() => message.info('编辑：' + record.name)}>编辑</a>
    },
  ]

  return (
    <MockContainer>
      <ProTable
        // 需要直接请求
        needInitFetch
        // 展示边框
        bordered
        // 不使用卡片包裹
        useCard={false}
        // table属性变化不更新query
        needUpdateQuery={false}
        scroll={null}
        // 本地表格属性操作的 localstorage 缓存key（全局唯一）
        cacheKey="cache1"
        columns={columns}
        dataApi="/user/getList.json"
        // 空值展示，默认为-（英文横线）
        emptyValue="无"
      />
    </MockContainer>
  )
}
```

## 基本使用

1. 使用卡片嵌套会出来一些额外的功能，均会用localstorage存储到本地
2. 打开【Network】然后点击刷新图标，可以看到请求的变化

```tsx
import { useState } from 'react'
import {
  Form,
  ProTable
} from '@fundam/antd'
import { message } from 'antd'

// 仅文档展示使用
import { MockContainer, ShowCode } from '../index'

export default () => {
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 140,
      onClick: (record: any) => {
        message.info('点击：' + record.id)
      }
    },
    {
      title: '名称',
      dataIndex: 'name',
      width: 140,
    },
    {
      title: '账号',
      dataIndex: 'account',
      width: 140,
    },
    {
      title: '手机号',
      dataIndex: 'mobile',
      width: 140,
      onCopy: (record: any) => record.mobile,
    },
    {
      title: '操作',
      dataIndex: 'op',
      width: 140,
      render: (_: string, record: any) => <a onClick={() => message.info('编辑：' + record.name)}>编辑</a>
    },
  ]

  return (
    <MockContainer>
      <ProTable
        // 需要直接请求
        needInitFetch
        // table属性变化不更新query
        needUpdateQuery={false}
        scroll={null}
        // 本地表格属性操作的 localstorage 缓存key（全局唯一）
        cacheKey="cache2"
        // 序号展示，PAGED-分页序号（和页码有关）；FLAT-和页码无关（每页都从0开始）
        pageNumbering="PAGED"
        columns={columns}
        dataApi="/user/getList.json"
        cardProps={{
          title: '用户列表'
        }}
      />
    </MockContainer>
  )
}
```

## 多选

1. 通过 `onSelectedRowRecordsChange` 或 `onSelectedRowKeysChange` 以及 `selectedMaxRow` 等等进行及其简单的选择项控制
2. Fundam默认支持跨页多选

```tsx
import { useState, useRef } from 'react'
import {
  Form,
  ProTable
} from '@fundam/antd'
import { message, Button } from 'antd'

// 仅文档展示使用
import { MockContainer, ShowCode } from '../index'

export default () => {
  const [selectRecords, setSelectRecords] = useState([])
  const [selectKeys, setSelectKeys] = useState([])
  
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 140,
      onClick: (record: any) => {
        message.info('点击：' + record.id)
      }
    },
    {
      title: '名称',
      dataIndex: 'name',
      width: 140,
    },
    {
      title: '账号',
      dataIndex: 'account',
      width: 140,
    },
    {
      title: '手机号',
      dataIndex: 'mobile',
      width: 140,
      onCopy: (record: any) => record.mobile,
    },
    {
      title: '操作',
      dataIndex: 'op',
      width: 140,
      render: (_: string, record: any) => <a onClick={() => message.info('编辑：' + record.name)}>编辑</a>
    },
  ]

  return (
    <MockContainer>
      <ProTable
        // 需要直接请求
        needInitFetch
        // table属性变化不更新query
        needUpdateQuery={false}
        scroll={null}
        cacheKey="cache2"
        // 序号展示，PAGED-分页序号（和页码有关）；FLAT-和页码无关（每页都从0开始）
        pageNumbering="PAGED"
        columns={columns}
        dataApi="/user/getList.json"
        cardProps={{
          title: '用户列表'
        }}
        // 选择项改变（按需任选其一即可）
        onSelectedRowRecordsChange={(selectedRowRecords) => setSelectRecords(selectedRowRecords)}
        onSelectedRowKeysChange={(selectedRowKeys) => setSelectKeys(selectedRowKeys)}
        // 最多支持选择的数量
        selectedMaxRow={2}
      />
      <ShowCode title="Records">{JSON.stringify(selectRecords, null, 2)}</ShowCode>
      <ShowCode title="Keys">{JSON.stringify(selectKeys, null, 2)}</ShowCode>
    </MockContainer>
  )
}
```

## 单选

1. 通过 `rowSelectionType="radio"` 即可更改选择类型

```tsx
import { useState, useRef } from 'react'
import {
  Form,
  ProTable
} from '@fundam/antd'
import { message, Button } from 'antd'

// 仅文档展示使用
import { MockContainer, ShowCode } from '../index'

export default () => {
  const [selectRecords, setSelectRecords] = useState([])
  const [selectKeys, setSelectKeys] = useState([])
  
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 140,
      onClick: (record: any) => {
        message.info('点击：' + record.id)
      }
    },
    {
      title: '名称',
      dataIndex: 'name',
      width: 140,
    },
    {
      title: '账号',
      dataIndex: 'account',
      width: 140,
    },
    {
      title: '手机号',
      dataIndex: 'mobile',
      width: 140,
      onCopy: (record: any) => record.mobile,
    },
    {
      title: '操作',
      dataIndex: 'op',
      width: 140,
      render: (_: string, record: any) => <a onClick={() => message.info('编辑：' + record.name)}>编辑</a>
    },
  ]

  return (
    <MockContainer>
      <ProTable
        // 需要直接请求
        needInitFetch
        // table属性变化不更新query
        needUpdateQuery={false}
        scroll={null}
        cacheKey="cache3"
        // 序号展示，PAGED-分页序号（和页码有关）；FLAT-和页码无关（每页都从0开始）
        pageNumbering="PAGED"
        columns={columns}
        dataApi="/user/getList.json"
        cardProps={{
          title: '用户列表'
        }}
        // 选择项改变（按需任选其一即可）
        onSelectedRowRecordsChange={(selectedRowRecords) => setSelectRecords(selectedRowRecords)}
        onSelectedRowKeysChange={(selectedRowKeys) => setSelectKeys(selectedRowKeys)}
        // 选择类型
        rowSelectionType="radio"
      />
      <ShowCode title="Record">{JSON.stringify(selectRecords[0], null, 2)}</ShowCode>
      <ShowCode title="Key">{selectKeys[0]}</ShowCode>
    </MockContainer>
  )
}
```

## 自定义控制

1. 打开【Network】查看变化

```tsx
import { useState, useRef } from 'react'
import {
  Form,
  ProTable
} from '@fundam/antd'
import { message, Button } from 'antd'

// 仅文档展示使用
import { MockContainer, ShowCode } from '../index'

export default () => {
  const tableRef = useRef<any>(null)
  
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 140,
      onClick: (record: any) => {
        message.info('点击：' + record.id)
      }
    },
    {
      title: '名称',
      dataIndex: 'name',
      width: 140,
    },
    {
      title: '账号',
      dataIndex: 'account',
      width: 140,
    },
    {
      title: '手机号',
      dataIndex: 'mobile',
      width: 140,
      onCopy: (record: any) => record.mobile,
    },
    {
      title: '操作',
      dataIndex: 'op',
      width: 140,
      render: (_: string, record: any) => <a onClick={() => message.info('编辑：' + record.name)}>编辑</a>
    },
  ]

  return (
    <MockContainer>
      <div style={{ marginBottom: 24 }}>
        <Button type="primary" onClick={() => tableRef.current.refresh()}>刷新</Button>
        <Button type="primary" onClick={() => tableRef.current.fetch({ id: 123 })} style={{ marginLeft: 8 }}>传参请求</Button>
      </div>
      <ProTable
        ref={tableRef}
        // 需要直接请求
        needInitFetch
        // table属性变化不更新query
        needUpdateQuery={false}
        scroll={null}
        cacheKey="cache4"
        columns={columns}
        dataApi="/user/getList.json"
        cardProps={{
          title: '用户列表'
        }}
      />
    </MockContainer>
  )
}
```

## 自定义数据获取

```tsx
import { useState, useRef } from 'react'
import {
  Form,
  ProTable
} from '@fundam/antd'
import { message, Button } from 'antd'

// 仅文档展示使用
import { MockContainer, ShowCode } from '../index'

export default () => {
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 140,
      onClick: (record: any) => {
        message.info('点击：' + record.id)
      }
    },
    {
      title: '名称',
      dataIndex: 'name',
      width: 140,
    },
    {
      title: '账号',
      dataIndex: 'account',
      width: 140,
    },
    {
      title: '手机号',
      dataIndex: 'mobile',
      width: 140,
      onCopy: (record: any) => record.mobile,
    },
    {
      title: '操作',
      dataIndex: 'op',
      width: 140,
      render: (_: string, record: any) => <a onClick={() => message.info('编辑：' + record.name)}>编辑</a>
    },
  ]

  return (
    <MockContainer>
      <ProTable
        // 需要直接请求
        needInitFetch
        // table属性变化不更新query
        needUpdateQuery={false}
        scroll={null}
        cacheKey="cache5"
        columns={columns}
        cardProps={{
          title: '用户列表'
        }}
        dataFunc={() => {
          // TODO 业务逻辑
          return {
            pageNo: 1,
            totalCount: 3,
            pageSize: 20,
            list: [
              {
                "id": 100000000001,
                "name": "张三",
                "account": "zhangsan",
                "mobile": "13878787979"
              },
              {
                "id": 100000000002,
                "name": "李四",
                "account": null,
                "mobile": "13998988989"
              },
              {
                "id": 100000000003,
                "name": "王五",
                "account": "wangwu",
                "mobile": "15178782121"
              }
            ]
          }
        }}
      />
    </MockContainer>
  )
}
```

## 最后

1. 与Form一样，无缝支持Antd原生所有的props
2. 更多用法，参考 [组合使用](/guide/page)
3. 这里列举了一些非常常见的使用方式，还有诸多高级用法这里就不一一列举了，例如还可以结合`query`使用，也可以进行缓存、预请求等等，具体可参考 [各组件Props](/guide/props)
