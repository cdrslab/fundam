import React, { useEffect, useRef, useState } from 'react'
import {
  TableProps as AntTableProps,
  TableColumnProps as AntTableColumnProps,
  Table as AntTable,
} from 'antd'
import { GetData } from '../../shared/types';
import { useFun } from '../../hooks/useFun';
import { get } from 'lodash';

export interface RowData {}

export interface ColumnProps<T> extends AntTableColumnProps<T> {
  key: string
  dataIndex: string // 索引
  title: ((props: any) => React.ReactNode) | React.ReactNode
  tooltip?: string // 提示
  // buttonsConfig?: ButtonConfig[]
}

interface TableProps extends Omit<AntTableProps, 'columns'>, GetData {
  column: ColumnProps<RowData>[]
  initPage: number // 初始化页码
  initPageSize: number // 初始化页面条数
  pageKey: string
  listKey: string
  pageSizeKey: string
  totalKey: string
}

export const Table: React.FC<TableProps> = ({
  // fun新加props
  // 请求接口相关
  dataFunc,
  dataApi,
  dataApiReqData = {},
  dataApiMethod = 'get',
  resDataPath,
  initPage = 1,
  initPageSize = 20,
  pageKey = 'page',
  listKey = 'list',
  pageSizeKey = 'pageSize',
  totalKey = 'total',
  rowKey = 'id',

  children,
  ...antProps
}) => {
  const [loading, setLoading] = useState(antProps.loading || false) // 加载中
  const { request } = useFun()
  const initRef = useRef(false)
  const [data, setData] = useState({
    list: [],
    total: 0,
    page: 1,
    pageSize: 20
  })

  useEffect(() => {
    if (!initRef.current) {
      init()
      initRef.current = true
    }
  }, [])

  const init = async () => {
    if (!dataApi && !dataFunc) return
    try {
      setLoading(true)
      // @ts-ignore
      let res = dataApi ? await request[dataApiMethod](dataApi, dataApiReqData) : await dataFunc(dataApiReqData)
      res = resDataPath ? get(res, resDataPath) : res
      const newData = {
        list: res[listKey],
        total: res[totalKey],
        page: res[pageKey],
        pageSize: res[pageSizeKey] || initPageSize
      }
      setData(newData)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(true)
    }
  }

  const handlePagination = async () => {

  }

  const onSearch = async () => {

  }

  // TODO 格式化columns

  const renderProps = {
    ...antProps,
    rowKey,
    size: antProps.size || 'small',
    scroll: antProps.scroll || { x: '100%' },
    dataSource: antProps.dataSource || data.list,
    pagination: antProps.pagination || (data.total > data.pageSize ? {
      current: data.page,
      pageSize: data.pageSize,
      total: data.total,
      onChange: handlePagination,
      showSizeChanger: false,
    } : false)
  }

  return (
    <AntTable
      {...renderProps as any}
    >
      {children}
    </AntTable>
  )
}
