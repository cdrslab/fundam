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

## Props

### 在Antd Table的Props基础上额外新增。支持原Antd Table的所有props

#### ProTableColumnProps类型

```ts
import { AntTableColumnProps } from 'antd'

export interface ProTableColumnProps<T> extends Omit<AntTableColumnProps<T>, 'key'> {
  // 索引
  dataIndex: string
  // 不可操作？
  disabled?: Boolean
  // 提示
  tooltip?: string
  // 最大行数，超过展示...
  maxLine?: number
  // 可点击 & 点击触发
  onClick?: (record: T) => void
  // 可复制 & 点击触发，返回值为赋值的value
  onCopy?: (record: T) => string | undefined
  // 改写复制为文案
  copyButtonText?: string
}
```

#### 同样通过GetData进行数据获取

下面Props列表，不包含已支持的Antd Table原始属性

| 属性               | 是否必须 | 类型                                                | 默认值        | 描述                                                                                                               |
|------------------|------|---------------------------------------------------|------------|------------------------------------------------------------------------------------------------------------------|
| columns           | 是    | ProTableColumnProps[]                             | -          | 表格的columns                                                                                                       |
| cacheKey           | 是    | string                                            | -          | 本地表格属性操作的 localstorage 缓存key（全局唯一），用于缓存对表格大小、宽度、展示列等调整的缓存（使其刷新页面还能保存用户的配置）                                       |
| dataFunc      | 否    | Function                                          | -      | 获取列表数据的方法（优先级高于dataApi）                                                                   |
| dataApi      | 否    | string                                            | -      | 获取列表数据的接口地址                                                                                                      |
| dataApiReqData      | 否    | any                                               | -      | 请求额外参数                                                                                                           |
| dataApiMethod      | 否    | 'get' \| 'post' \| 'delete' \| 'put'              | -      | 请求方法                                                                                                             |
| resDataPath      | 否    | string                                            | -      | 响应数据提取的path，类似于 _.get(res, resDataPath)                                                                          |
| cacheKey      | 否    | string                                            | -      | 注意cacheKey的唯一性，设置后，会对通过dataApi或dataFunc获取的数据进行localstorage缓存，默认120s                                              |
| cacheExpirationSec      | 否    | number                                            | 120    | 结合cacheKey可以对通过dataApi或dataFunc获取的数据进行缓存，默认120s，可以更改此值，更改缓存时间                                                    |
| dataRule      | 否    | boolean \| (() => boolean)                        | -                                                                                                        | 可以前置通过 dataRule 控制是否发起请求，dataRule值/函数返回值为false时不发请求                                                              |
| needInitFetch           | 否    | boolean                                           | false      | 初始化请求一次                                                                                                          |
| needUpdateQuery           | 否    | boolean                                           | false      | 将table的各项状态数据，如分页参数、筛选参数更新到地址栏（Query）                                                                            |
| useCard           | 否    | boolean                                           | true       | 使用卡片包裹，会在卡片的右上角添加对整个表格控制的一些图标，分别为：请求query缓存、表格数据刷新、调整表格大小、调整表格展示的列                                               |
| parseQueryKeys           | 否    | Array<string>                                     | -          | 结合needUpdateQuery使用，需要parse的query key，比如，传入：['page']，page: '1' => page: 1                                        |
| parseArrayKeys           | 否    | Array<string>                                     | -          | 结合needUpdateQuery使用，请求前将一些逗号分割的query数据（通常为多选表单项，其query值用逗号分割展示）格式化为数组                                            |
| rowKey           | 否    | string                                            | 'id'       | 行唯一key                                                                                                           |
| cacheConfigExpirationSec           | 否    | number                                            | 86400 * 30 | 结合cacheKey使用，保存用户对表格属性操作的时间                                                                                      |
| cardProps           | 否    | CardProps（Antd）                                   | -          | 对外层Card组件的配置                                                                                                     |
| initPage           | 否    | number                                            | 1          | 初始页码                                                                                                             |
| initPageSize           | 否    | number                                            | 20         | 初始每页条数                                                                                                           |
| pageKey           | 否    | string                                            | 'page'     | 页码key，通常为服务端请求/响应的page字段名                                                                                        |
| pageSizeKey           | 否    | string                                            | 'pageSize' | 每页条数key，通常为服务端请求/响应的pageSize字段名                                                                                  |
| listKey           | 否    | string                                            | 'list'     | list key，通常为服务端响应的列表字段名                                                                                          |
| totalKey           | 否    | string                                            | 'total'    | 总条数key，通常为服务端响应的总条数字段名                                                                                           |
| pageNumbering           | 否    | 'PAGED' \| 'FLAT'                                 | -          | 展示序号？PAGED表示页码连续序号，FLAT表示每页从1开始                                                                                  |
| emptyValue           | 否    | string                                            | '-'        | 空值展示                                                                                                             |
| onSelectedRowKeysChange           | 否    | (selectedRowKeys: Array<any>) => void             | -          | selectedRowKeys是选中的“rowKey”（传入的，默认为id）列表。选中触发，传入onSelectedRowKeysChange或onSelectedRowRecordsChange，会自动给表格加上可选择样式 |
| onSelectedRowRecordsChange           | 否    | (selectedRowRecords: Array<any>) => void          | -          | selectedRowRecords是选中的整行数据数组。选中触发，传入onSelectedRowKeysChange或onSelectedRowRecordsChange，会自动给表格加上可选择样式             |
| initSelectedRowKeys           | 否    | Array<string \| number>                           | -          | 结合onSelectedRowKeysChange或onSelectedRowRecordsChange使用，表示初始化选中的行keys                                             |
| selectedMaxRow           | 否    | number                                            | -          | 结合onSelectedRowKeysChange或onSelectedRowRecordsChange使用，表示最多可以选中的行数                                               |
| rowSelectionType           | 否    | 'checkbox' \| 'radio'                             | -          | 结合onSelectedRowKeysChange或onSelectedRowRecordsChange使用,选择类似                                                      |
| selectedMaxRowErrorMessage           | 否    | string                                            | -          | 结合selectedMaxRow使用，无法选中超过此限制数量的行                                                                                 |
| selectedDisabledRows           | 否    | Array<string \| number>                           | -          | 已选中需置灰的数据，如 [1,2]，当{rowKey} 为 1 or 2 的行会置灰                                                                       |
| onPaginationChange           | 否    | (page: number, pageSize: number) => Promise<void> | -          | 页码切换                                                                                                             |
| updateQueryAndFetch           | 否    | (search: Record<string, any> \| string) => void   | -          | 更新query参数并重新请求                                                                                                   |
| tableTopExtra           | 否    | React.ReactNode                                   | -          | table顶部的额外元素，比如展示“已选中{selectedRowKeys.length}条，<a>清空</a>”                                                        |
| resFormat           | 否    | (res: any) => any                                 | -          | 响应数据格式化                                                                                                          |


