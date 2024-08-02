---
title: Table
order: 9
---

# ProTable

## 描述

是对Antd Table的增强实现

## 导入

```ts
import { ProTable } from '@fundam/antd'
```

## 基础使用示例

```tsx | pure
import { ProTable } from '@fundam/antd'
import { message } from 'antd'

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
      // 直接展示复制图标，会复制这里的返回值
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
    <ProTable
      // 需要直接请求
      needInitFetch
      // 展示边框
      bordered
      // true：使用卡片包裹，会在卡片的右上角添加对整个表格控制的一些图标，分别为：请求query缓存、调整表格大小、调整表格展示的列
      useCard
      // table属性变化不更新query
      needUpdateQuery={false}
      // 与Antd Table 的scroll props一致
      scroll={null}
      // 本地表格属性操作的 localstorage 缓存key（全局唯一），用于缓存对表格大小、宽度、展示列等调整的缓存（使其刷新页面还能保存用户的配置）
      cacheKey="cache1"
      columns={columns}
      // 使用GetData控制获取数据方式
      dataApi="/user/getList.json"
      // 空值展示，默认为-（英文横线）
      emptyValue="无"
    />
  )
}
```

## 可选择行的表格

```tsx | pure
import { useState } from 'react'
import { ProTable } from '@fundam/antd'
import { message } from 'antd'

export default () => {
  // 选择的行对象，为一个对象数组
  const [selectRecords, setSelectRecords] = useState([])
  // 选择的行rowKey，默认为id，通常为一个字符串数组或者数字数组
  const [selectKeys, setSelectKeys] = useState([])
  
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 140,
      // 有onClick时，当作一个按钮渲染
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
      // 直接展示复制图标，会复制这里的返回值
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
    <ProTable
      // 需要直接请求
      needInitFetch
      // table属性变化不更新query
      needUpdateQuery={false}
      // 与Antd Table 的scroll props一致
      scroll={null}
      // 本地表格属性操作的 localstorage 缓存key（全局唯一），用于缓存对表格大小、宽度、展示列等调整的缓存（使其刷新页面还能保存用户的配置）
      cacheKey="cache2"
      // 序号展示，PAGED-分页序号（和页码有关）；FLAT-和页码无关（每页都从0开始）
      pageNumbering="PAGED"
      columns={columns}
      dataApi="/user/getList.json"
      // 外部卡片的props配置，与Antd Card Props一致
      cardProps={{
        title: '用户列表'
      }}
      // 选择项改变（按需任选其一即可）
      onSelectedRowRecordsChange={(selectedRowRecords) => setSelectRecords(selectedRowRecords)}
      onSelectedRowKeysChange={(selectedRowKeys) => setSelectKeys(selectedRowKeys)}
      // 最多支持选择的数量
      selectedMaxRow={2}
    />
  )
}
```
