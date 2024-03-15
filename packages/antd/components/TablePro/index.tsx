import React, { useEffect, useRef, useState } from 'react'
import {
  TableProps as AntTableProps,
  TableColumnProps as AntTableColumnProps,
  Table as AntTable,
  Button,
  ButtonProps as AntButtonProps, Tooltip, Card
} from 'antd'

import './index.less'
import { GetData } from '../../shared/types';
import { useFun } from '../../hooks/useFun';
import { get, throttle } from 'lodash';
import { useAlias } from '../../hooks/useAlias';
import { adjustButtonMargins } from '../../shared/utils';
import { isDef } from '@fundam/utils';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useLocalStorage } from '@fundam/hooks/useLocalStorage';
import { TableResizableTitle } from '../TableResizableTitle';
import { TableProps, TableRowButton } from '../Table';

// 处理table按钮渲染（换行对齐）
const throttledAdjustButtonMargins = throttle(adjustButtonMargins, 50)

export interface RowData {}

export interface ColumnProps<T> extends AntTableColumnProps<T> {
  dataIndex: string // 索引
  title: ((props: any) => React.ReactNode) | React.ReactNode
  key?: string
  tooltip?: string // 提示
  onClick?: (record: any) => void
  // buttonsConfig?: ButtonConfig[]
}

interface TableProProps extends TableProps {
  tableTitle?: string // 标题
  extra?: ((props: any) => React.ReactNode) | React.ReactNode
}

interface CacheData {
  columnsWidthMap?: Record<string, number> // 缓存column.dataIndex => width，用于拖拽更改表格列宽度
}

// TODO 使用Fun Table 替换 antd Table
export const TablePro: React.FC<TableProProps> = ({
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
  alias,
  indexType,
  emptyValue = '-',
  cacheKey,
  tableTitle,
  extra,

  rowKey = 'id',
  columns,

  children,
  ...antProps
}) => {
  const [loading, setLoading] = useState(antProps.loading || false) // 加载中
  const { request } = useFun()
  const { setAlias } = useAlias()
  const initRef = useRef(false)
  const [cacheLastRequestParams, setCacheLastRequestParams] = useState<any>({})
  const [data, setData] = useState({
    list: [],
    total: 0,
    page: 1,
    pageSize: 20
  })
  const [tableCache, setTableCache] = useLocalStorage<CacheData>(cacheKey, null)

  useEffect(() => {
    // 换行按钮对齐
    throttledAdjustButtonMargins()
  }, [data])

  useEffect(() => {
    if (!initRef.current) {
      fetchData()
      alias && setAlias(alias, { fetchData, refreshData })
      initRef.current = true
    }
    // 处理按钮换行样式
    window.addEventListener('resize', throttledAdjustButtonMargins)
    return () => {
      window.removeEventListener('resize', throttledAdjustButtonMargins)
    }
  }, [])

  const fetchData = async (params: any = {}) => {
    if (!dataApi && !dataFunc) return
    try {
      setLoading(true)
      const requestData = { ...dataApiReqData, ...params }
      setCacheLastRequestParams(requestData)
      // @ts-ignore
      let res = dataApi ? await request[dataApiMethod](dataApi, requestData) : await dataFunc(requestData)
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
      setLoading(false)
    }
  }

  const handlePagination = (page: number, pageSize: number) => fetchData({ ...cacheLastRequestParams, page, pageSize })

  const refreshData = () => fetchData(cacheLastRequestParams)

  const handleResize = (column: any) => {
    return (e: any, { size }: any) => {
      const newTableCacheColumnsWidth = { ...tableCache?.columnsWidthMap }
      newTableCacheColumnsWidth[column.dataIndex] = Math.max(50, Math.min(400, size.width)); // 限制宽度区间
      setTableCache({ ...tableCache, columnsWidthMap: newTableCacheColumnsWidth })
      throttledAdjustButtonMargins()
    }
  }

  const buildExtra = () => {
    return null
  }

  // 格式化columns
  let tableColumns: any[] = []
  columns.forEach((column: any) => {
    if (!column.title || !column.dataIndex) return

    // 展示问号说明
    if (column.tooltip) {
      const currentColumn = {
        ...column,
        title: () => (
          <div className="table-title">
            <span style={{ marginRight: 8 }}>{column.title}</span>
            <Tooltip placement="top" title={column.tooltip}>
              <QuestionCircleOutlined />
            </Tooltip>
          </div>
        ),
        key: column.dataIndex
      }
      if (column.onClick) currentColumn.render = (_: any, record: any) => <TableRowButton onClick={record.onClick}>{record[column.dataIndex]}</TableRowButton>
      tableColumns.push(currentColumn)
      return
    }

    if (!column.render) {
      if (column.onClick) {
        tableColumns.push({
          ...column,
          render: (_: any, record: any) => <TableRowButton onClick={record.onClick}>{record[column.dataIndex]}</TableRowButton>,
          key: column.dataIndex
        })
      } else {
        tableColumns.push({
          ...column,
          render: (value: any) => <span>{isDef(value) && value !== '' ? value : emptyValue}</span>,
          key: column.dataIndex
        })
      }
    } else {
      tableColumns.push(column)
    }
  })

  // 使用缓存的宽度
  tableColumns = tableColumns.map((item, index) => ({
    ...item,
    width: tableCache?.columnsWidthMap?.[item.dataIndex] || item.width,
    onHeaderCell: (column: any) => ({
      width: column.width,
      onResize: handleResize(item),
    }),
  }))

  // 格式化数据
  let listData = antProps.dataSource || data.list || []
  listData = listData.map((item: any, index: number) => ({
    ...item,
    _index: indexType ? (indexType === 'pagination' ? (data.page - 1) * data.pageSize + index + 1 : index + 1) : null,
  }))

  const renderProps = {
    ...antProps,
    rowKey,
    loading,
    columns: tableColumns,
    size: antProps.size || 'small',
    scroll: antProps.scroll || { x: 'max-content' },
    dataSource: listData,
    components: { header: { cell: TableResizableTitle } },
    pagination: antProps.pagination || (data.total > data.pageSize ? {
      current: data.page,
      pageSize: data.pageSize,
      total: data.total,
      onChange: handlePagination,
      showSizeChanger: true,
    } : false)
  }

  return (
    <Card title={tableTitle} extra={buildExtra()} bordered={false}>
      <AntTable
        {...renderProps as any}
      >
        {children}
      </AntTable>
    </Card>
  )
}
