import React, { useEffect, useRef, useState } from 'react'

import { TableProps, CacheTableData, TableRowButton } from '../Table';
import { Button, Card, Checkbox, Dropdown, message, Popover, Table as AntTable, Tooltip } from 'antd';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import { useLocalStorage } from '@fundam/hooks/useLocalStorage';
import {
  ColumnHeightOutlined,
  CopyOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useFun } from '../../hooks/useFun';
import { useAlias } from '../../hooks/useAlias';
import { copyToClipboard, throttledAdjustButtonMargins } from '../../shared/utils';
import { get } from 'lodash';
import { isDef } from '@fundam/utils';
import { TableResizableTitle } from '../TableResizableTitle';

interface TableProProps extends TableProps {
  tableTitle?: string // 标题
  extra?: ((props: any) => React.ReactNode) | React.ReactNode
}

interface CacheTableProData extends CacheTableData {
  columnKeys?: Array<string> // 开启的列（未在columnKeys中的列会隐藏）
  size?: 'large' | 'middle' | 'small' // 表格大小
}

// TODO 0.2 优化：与 Table TableForm等抽出共性
export const TablePro: React.FC<TableProProps> = ({
  tableTitle,
  extra,
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

  rowKey = 'id',
  columns,

  children,
  ...funProps
}) => {
  // 外部控制列展示
  const [selectFilterColumns, setSelectFilterColumns] = useState<string[]>([]) // 选中的筛选列
  const [currentColumns, setCurrentColumns] = useState(columns) // 渲染的列
  const [tableCache, setTableCache] = useLocalStorage<CacheTableProData>(cacheKey, null)
  const [loading, setLoading] = useState(funProps.loading || false) // 加载中
  const { request } = useFun()
  const { setAlias } = useAlias()
  const initRef = useRef(false)
  const cacheLastRequestParamsRef = useRef<any>({})
  const [data, setData] = useState({
    list: [],
    total: 0,
    page: 1,
    pageSize: 20
  })
  // const [tableCache, setTableCache] = useLocalStorage<CacheTableData>(cacheKey, null)

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

  useEffect(() => {
    initFilterColumns()
  }, []);

  const fetchData = async (params: any = {}) => {
    if (!dataApi && !dataFunc) return
    try {
      setLoading(true)
      const requestData = { ...dataApiReqData, ...params }
      cacheLastRequestParamsRef.current = requestData
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

  const handlePagination = (page: number, pageSize: number) => fetchData({ ...cacheLastRequestParamsRef.current, page, pageSize })

  const refreshData = () => fetchData(cacheLastRequestParamsRef.current)

  const handleResize = (column: any) => {
    return (e: any, { size }: any) => {
      const newTableCacheColumnsWidth = { ...tableCache?.columnsWidthMap }
      newTableCacheColumnsWidth[column.dataIndex] = Math.max(50, Math.min(400, size.width)); // 限制宽度区间
      setTableCache({ ...tableCache, columnsWidthMap: newTableCacheColumnsWidth })
      throttledAdjustButtonMargins()
    }
  }

  const onTableCacheChange = (key: string, value: any) => {
    setTableCache({
      ...tableCache,
      [key]: value
    })
  }

  const initFilterColumns = () => {
    if (!tableCache?.columnKeys) {
      // 没有缓存数据，默认选择全部
      setSelectFilterColumns(columns.map(item => item.dataIndex))
    } else {
      // 有缓存数据
      onTableColumnsChange(tableCache.columnKeys)
    }
  }

  const onTableColumnsChange = (checkedValue: CheckboxValueType[]) => {
    const stringValues = checkedValue as string[]
    setSelectFilterColumns(stringValues)
    const curColumns: any[] = []
    columns.forEach((item: any) => {
      if (!stringValues.includes(item.dataIndex)) return
      curColumns.push(item)
    })
    setCurrentColumns(curColumns)
    onTableCacheChange('columnKeys', stringValues)
  }

  // 格式化columns
  let tableColumns: any[] = []
  currentColumns.forEach((column: any) => {
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

  // 使用缓存的宽度 & onCopy处理
  tableColumns = tableColumns.map((item, index) => ({
    ...item,
    width: tableCache?.columnsWidthMap?.[item.dataIndex] || item.width,
    onHeaderCell: (column: any) => ({
      width: column.width,
      onResize: handleResize(item),
    }),
    render: (text: any, record: any, index: number) => {
      const originalRender = item.render ? item.render(text, record, index) : text
      return (
        <span>
          {originalRender}
          {
            item.onCopy ?
              <Button
                type="link"
                icon={<CopyOutlined />}
                style={{ padding: 0 }}
                onClick={() => {
                  const copyText = item.onCopy?.(record);
                  if (copyText) {
                    copyToClipboard(copyText);
                  } else {
                    message.error('复制失败');
                  }
                }}
              />
              : null
          }
        </span>
      )
    }
  }))

  // 格式化数据
  let listData = funProps.dataSource || data.list || []
  listData = listData.map((item: any, index: number) => ({
    ...item,
    _index: indexType ? (indexType === 'pagination' ? (data.page - 1) * data.pageSize + index + 1 : index + 1) : null,
  }))

  const renderProps = {
    ...funProps,
    rowKey,
    loading,
    columns: tableColumns,
    size: funProps.size || 'small',
    scroll: funProps.scroll || { x: 'max-content' },
    dataSource: listData,
    components: { header: { cell: TableResizableTitle } },
    pagination: funProps.pagination || (data.total > data.pageSize ? {
      current: data.page,
      pageSize: data.pageSize,
      total: data.total,
      onChange: handlePagination,
      showSizeChanger: true,
    } : false)
  }

  const buildExtra = () => {
    const filterColumnOptions: any[] = columns.map(item => ({
      label: item.title,
      value: item.dataIndex,
      key: item.dataIndex,
      disabled: item.title === '操作' || item.disabled,
    }))

    const filterContent = (
      <Checkbox.Group
        value={selectFilterColumns}
        onChange={onTableColumnsChange}
        options={filterColumnOptions}
        style={{ width: 200 }}
      />
    )

    const sizeItems = [
      {
        key: 'large',
        label: (
          <a onClick={() => onTableCacheChange('size', 'large')}>大</a>
        )
      },
      {
        key: 'middle',
        label: (
          <a onClick={() => onTableCacheChange('size', 'middle')}>中</a>
        )
      },
      {
        key: 'small',
        label: (
          <a onClick={() => onTableCacheChange('size', 'small')}>小</a>
        )
      },
    ]

    return (
      <>
        {extra}
        <ReloadOutlined style={{ marginLeft: 12 }} onClick={refreshData} />
        <Dropdown menu={{ items: sizeItems }}>
          <ColumnHeightOutlined style={{ marginLeft: 12, fontSize: 16, color: 'rgba(0, 0, 0, 0.75)' }} />
        </Dropdown>
        <Popover content={filterContent} placement="bottomLeft" title="筛选列" trigger="click">
          <SettingOutlined style={{ marginLeft: 12, fontSize: 16 }} />
        </Popover>
      </>
    )
  }

  return (
    <Card
      title={tableTitle}
      extra={buildExtra()}
      bordered={false}
    >
      <AntTable
        {...renderProps as any}
        size={tableCache?.size}
      >
        {children}
      </AntTable>
    </Card>
  )
}