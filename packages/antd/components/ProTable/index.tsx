import React, {
  forwardRef,
  useEffect,
  useImperativeHandle, useMemo,
  useRef,
  useState
} from 'react'
import {
  Button,
  Card,
  Checkbox,
  Divider,
  Dropdown,
  Empty, Input, message, Popover, Space,
  Table as AntTable,
  TableColumnProps as AntTableColumnProps, Tooltip
} from 'antd'
import { ButtonProps as AntButtonProps } from 'antd/es/button/button'
import { CardProps } from 'antd/es/card/Card'
import { debounce } from 'lodash'
import {
  CoffeeOutlined,
  ColumnHeightOutlined, CopyOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router'
import { union } from 'lodash'
import { isDef } from '@fundam/utils'

import { GetData } from '../../shared/types';
import { TablePaginationConfig, TableProps as AntTableProps } from 'antd/es/table/InternalTable'
import { useFun } from '../../hooks/useFun'
import { useLocalStorage } from '@fundam/hooks'
import { CheckboxValueType } from 'antd/es/checkbox/Group'
import {
  arrayRemoveByValues,
  copyToClipboard,
  getData,
  objArrayRemoveByValuesKey,
  objArrayUnionByValuesKey, throttledAdjustButtonMargins
} from '../../shared/utils'
import { TableResizableTitle } from '../TableResizableTitle'
import { TextWithTooltip } from '../TextWithTooltip'
import { FETCH_DEBOUNCE } from '../../shared/constants'
import { useQueryParams } from '../../hooks/useQueryParams';

export interface ProTableInstance {
  fetch: (params: any, replace?: Boolean) => Promise<void>
  refresh: () => Promise<void>
}

export interface ProTableColumnProps<T> extends Omit<AntTableColumnProps<T>, 'key'> {
  // 索引
  dataIndex: string
  // 支持自定义title
  // title: ((props: any) => React.ReactNode) | React.ReactNode | string
  // 不可操作？
  disabled?: Boolean
  // 唯一key，不传使用dataIndex
  // key?: string // TODO 不使用key
  // 提示
  tooltip?: string
  // 最大行数，超过展示...
  maxLine?: number
  // 可点击 & 点击触发
  onClick?: (record: T) => void
  // 可复制 & 点击触发，返回值为赋值的value
  onCopy?: (record: T) => string | undefined
}

// T为table行（record）的Model
export interface ProTableProps<T> extends Omit<AntTableProps, 'columns'>, GetData {
  // 使用query
  needUpdateQuery?: boolean
  // 行唯一key
  rowKey: string
  columns: Array<ProTableColumnProps<T>>
  // table配置缓存key
  cacheKey: string
  // table配置项缓存时间，默认30天
  cacheConfigExpirationSec?: number
  // 外层card props
  cardProps?: CardProps
  // 初始页码，默认：1
  initPage?: number
  // 初始每页条数，默认：20
  initPageSize?: number
  // 页码key，通常为服务端请求/响应的page字段名
  pageKey?: string
  // 每页条数key，通常为服务端请求/响应的pageSize字段名
  pageSizeKey?: string
  // list key，通常为服务端响应的列表字段名
  listKey?: string
  // 总条数key，通常为服务端响应的总条数字段名
  totalKey?: string
  // 展示序号？PAGED表示页码连续序号，FLAT表示每页从1开始
  pageNumbering?: 'PAGED' | 'FLAT'
  // 空值展示，默认 “-”
  emptyValue?: string
  // 选择相关
  // 初始化选中的行keys
  initSelectedRowKeys?: Array<string | number>
  // 最多可选择行数
  selectedMaxRow?: number
  // 超出选择行数限制
  selectedMaxRowErrorMessage?: string
  // 选中的key改变时
  onSelectedRowKeysChange?: (selectedRowKeys: Array<any>) => void
  // 选中的record改变时
  onSelectedRowRecordsChange?: (selectedRowRecords: Array<any>) => void
  // 页码切换
  onPaginationChange?: (page: number, pageSize: number) => Promise<void>
  // 更新参数并重新请求
  updateQueryAndFetch?: (search: Record<string, any> | string) => void
}

// 对应右上角各项操作图标，使用localstorage缓存
interface ProTableCacheData {
  // 缓存column.dataIndex => width，用于拖拽更改表格列宽度
  columnsWidthMap?: Record<string, number>
  // 排出的列（排出的列隐藏）
  excludedColumnKeys?: Array<string>
  // 表格大小
  size?: 'large' | 'middle' | 'small'
  // 快捷查询
  quickQuery?: Array<{ key: string, label: any }>
}

export interface TableRowButtonProps extends Omit<AntButtonProps, 'onClick'> {
  onClick: (e: MouseEvent, extra?: { refreshData?: () => void, fetchData?: (params: any) => void }) => void
}

export const TableRowButton: React.FC<TableRowButtonProps> = ({ children, onClick, ...antProps }) => {
  return (
    <Button
      {...antProps}
      onClick={onClick as any}
      type="link"
      className="fun-table-row-button"
    >
      {children}
    </Button>
  )
}

// 缓存table的各项数据，默认三十天过期（不操作的情况下）
const CACHE_CONFIG_TIME = 86400 * 30
// 缓存不需要查看的列，与 ProTableCacheData excludedColumnKeys 对应
const CACHE_EXCLUDED_COLUMN_KEYS_KEY = 'excludedColumnKeys'

// props的类型为 ProTableProps<T>
export const ProTable = forwardRef<any, ProTableProps<any>>((props, ref) => {
  const {
    // 必须props
    rowKey,
    cardProps = {},
    columns,
    cacheKey,
    cacheConfigExpirationSec = CACHE_CONFIG_TIME,

    // 基础props
    initPage = 1,
    initPageSize = 20,
    pageKey = 'page',
    pageSizeKey = 'pageSize',
    listKey = 'list',
    totalKey = 'total',
    emptyValue = '-',
    pageNumbering,
    needUpdateQuery = false,

    // 选择相关
    initSelectedRowKeys = [],
    selectedMaxRow,
    selectedMaxRowErrorMessage = '超出限制',
    onSelectedRowKeysChange,
    onSelectedRowRecordsChange,
    onPaginationChange,

    dataFunc,
    dataApi,
    dataApiReqData,
    dataApiMethod,
    dataRule,
    resDataPath,

    ...otherProps
  } = props
  const { request } = useFun()
  const navigate = useNavigate()
  // 右上角功能图标所需各项状态
  // table缓存配置（table右上角图标功能 配置缓存）
  const [tableCache, setTableCache] = useLocalStorage<ProTableCacheData>(cacheKey, null, cacheConfigExpirationSec)
  // 加载中（不可操作：查询、重置、刷新）
  const [loading, setLoading] = useState(false)
  // 快捷查询名称
  const [quickQueryName, setQuickQueryName] = useState('') // 快捷查询名称

  // 选则行相关
  const [selectedRowKeys, setSelectedRowKeys] = useState<Array<any>>(initSelectedRowKeys) // 选择的行key
  const [selectedRowRecords, setSelectedRowRecords] = useState<Array<any>>([]) // 临时存储

  const { setQuery } = useQueryParams()

  // 列表相关
  const [data, setData] = useState({
    list: [],
    total: 0,
    page: initPage,
    pageSize: initPageSize
  })
  // 缓存上一次请求参数，用于刷新
  const cacheLastRequestParamsRef = useRef<any>({})

  // 所有columns的key
  const columnKeys = useMemo(() => columns.map(item => item.dataIndex), [columns])
  // 当前开启（展示）的列
  const currentColumns = useMemo(() => {
    if (!tableCache?.[CACHE_EXCLUDED_COLUMN_KEYS_KEY] || !tableCache[CACHE_EXCLUDED_COLUMN_KEYS_KEY]?.length) return [...columns]
    return columns.filter(item => !tableCache[CACHE_EXCLUDED_COLUMN_KEYS_KEY]?.includes(item.dataIndex))
  }, [columns, tableCache])
  // 选中的columnKeys
  const selectedColumnKeys = useMemo(() => currentColumns.map(item => item.dataIndex), [currentColumns])

  // 选择行变化
  useEffect(() => {
    onSelectedRowKeysChange && onSelectedRowKeysChange(selectedRowKeys)
  }, [selectedRowKeys])
  useEffect(() => {
    onSelectedRowRecordsChange && onSelectedRowRecordsChange(selectedRowRecords)
  }, [selectedRowRecords])

  // tableRef actions挂载
  useImperativeHandle(ref, () => ({
    fetch,
    refresh,
  }), [])

  // table缓存属性设置
  const onTableCacheChange = (key: string, value: any) => {
    setTableCache({
      ...tableCache,
      [key]: value
    })
  }

  const fetch = debounce(async (params: any = {}, replace = false) => {
    if (!dataApi && !dataFunc) return
    try {
      setLoading(true)
      const requestData = replace ? { ...dataApiReqData, ...params } : {
        ...dataApiReqData,
        [pageKey]: initPage,
        [pageSizeKey]: initPageSize,
        ...params
      }
      const res = await getData({
        dataApi,
        dataFunc,
        dataApiMethod,
        resDataPath,
        dataRule,
        dataApiReqData: requestData,
      }, request)

      // 未请求到数据，不更新
      if (!res) return

      // 缓存本次请求参数
      cacheLastRequestParamsRef.current = { ...requestData }
      setData({
        list: res[listKey],
        total: res[totalKey],
        page: res[pageKey],
        pageSize: res[pageSizeKey] || initPageSize
      })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, FETCH_DEBOUNCE)

  const refresh = async () => fetch(cacheLastRequestParamsRef.current)

  const handlePagination = async (page: number, pageSize: number) => {
    if (onPaginationChange) {
      await onPaginationChange(page, pageSize)
    } else {
      const params = { ...cacheLastRequestParamsRef.current, [pageKey]: page, [pageSizeKey]: pageSize }
      if (needUpdateQuery) {
        setQuery(params)
        // updateQueryAndFetch(params)
      } else {
        await fetch(params)
      }
    }
  }

  const onSelectedColumnKeysChange = (checkedValue: CheckboxValueType[]) => {
    const excludedColumns = columns.filter(item => !checkedValue.includes(item.dataIndex)).map(item => item.dataIndex)
    onTableCacheChange(CACHE_EXCLUDED_COLUMN_KEYS_KEY, excludedColumns)
  }

  const navigateQuickQuery = async (path: string) => {
    if (!needUpdateQuery) return
    navigate(path)
  }

  // 选中&取消选中（支持跨页多选）
  const selectLengthCheck = (selectData: Array<any>) => {
    if (!selectedMaxRow) return true
    return selectData && selectData.length <= selectedMaxRow
  }
  const onTableSelect = (record: any, selected: boolean) => {
    const newSelectedRowKeys: Array<any> = [...selectedRowKeys]
    const newSelectedRowRecords: Array<any> = [...selectedRowRecords]

    if (selected) {
      // 选中
      newSelectedRowKeys.push(record[rowKey as string])
      newSelectedRowRecords.push(record)

      if (!selectLengthCheck(newSelectedRowKeys)) {
        message.error(selectedMaxRowErrorMessage)
        return
      }

      setSelectedRowKeys(newSelectedRowKeys)
      setSelectedRowRecords(newSelectedRowRecords)
    } else {
      setSelectedRowKeys(arrayRemoveByValues(newSelectedRowKeys, [record[rowKey as string]]))
      setSelectedRowRecords(objArrayRemoveByValuesKey(newSelectedRowRecords, [record], rowKey as string))
    }
  }
  const onTableSelectAll = (selected: boolean) => {
    const currentPageRowKeys = data.list.map(i => i[rowKey as string])
    const newSelectedRowKeys = [...selectedRowKeys]
    const newSelectedRowRecords = [...selectedRowRecords]

    if (selected) {
      // 选中
      const unionNewSelectedRowKeys = union(newSelectedRowKeys, currentPageRowKeys)
      if (!selectLengthCheck(unionNewSelectedRowKeys)) {
        message.error(selectedMaxRowErrorMessage)
        return
      }
      setSelectedRowKeys(unionNewSelectedRowKeys)
      setSelectedRowRecords(objArrayUnionByValuesKey(newSelectedRowRecords, data.list, rowKey as string))
    } else {
      setSelectedRowKeys(arrayRemoveByValues(newSelectedRowKeys, currentPageRowKeys))
      setSelectedRowRecords(objArrayRemoveByValuesKey(newSelectedRowRecords, data.list, rowKey as string))
    }
  }

  const addQuickQueryItem = () => {
    if (!quickQueryName) {
      message.error('请输入快捷查询名称')
      return
    }
    if (!window.location.search) {
      message.error('抱歉，当前页面不允许保存快捷查询')
      return
    }
    const existed = tableCache?.quickQuery?.find(item => item.key === window.location.pathname + window.location.search)
    if (existed) {
      setQuickQueryName('')
      message.error('已存在相同快捷查询：' + existed.label)
      return;
    }
    const existedName = tableCache?.quickQuery?.find(item => item.label === quickQueryName)
    if (existedName) {
      message.error('已存在相同快捷查询名称：' + existedName.label)
      return;
    }
    setTableCache({
      ...tableCache,
      quickQuery: [
        ...(tableCache?.quickQuery || []),
        {
          key: window.location.pathname + window.location.search,
          label: quickQueryName
        }
      ]
    })
    setQuickQueryName('')
  }

  const handleResize = (column: any) => {
    return (_e: any, { size }: any) => {
      const newTableCacheColumnsWidth = { ...tableCache?.columnsWidthMap }
      newTableCacheColumnsWidth[column.dataIndex] = Math.max(50, Math.min(400, size.width)); // 限制宽度区间
      setTableCache({ ...tableCache, columnsWidthMap: newTableCacheColumnsWidth })
      throttledAdjustButtonMargins()
    }
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
        value={selectedColumnKeys}
        onChange={onSelectedColumnKeysChange}
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
        {cardProps.extra}
        {
          needUpdateQuery ?
            <Dropdown
              menu={{ items: (tableCache?.quickQuery || []).map(item => ({
                  key: item.key,
                  label: <a onClick={() => navigateQuickQuery(item.key)}>{item.label}</a>
                })) || []
              }}
              placement="bottom"
              overlayStyle={{ maxWidth: '70vw' }}
              dropdownRender={(menu) => (
                <div className="quick-query-dropdown">
                  {
                    tableCache?.quickQuery?.length ?
                      React.cloneElement(menu as React.ReactElement, { style: { boxShadow: 'none' } })
                      :
                      <Empty />
                  }
                  <Divider style={{ margin: '8px 0' }} />
                  <Space style={{ padding: '4px 4px 12px 12px' }}>
                    <Input
                      placeholder="查询名称"
                      value={quickQueryName}
                      onChange={(e) => setQuickQueryName(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                    <Button type="text" icon={<PlusOutlined />} onClick={addQuickQueryItem}>
                      添加快捷查询
                    </Button>
                  </Space>
                </div>
              )}
            >
              <CoffeeOutlined style={{ marginLeft: 12, fontSize: 16 }} />
            </Dropdown>
            :
            null
        }
        <ReloadOutlined style={{ marginLeft: 12 }} onClick={refresh} />
        <Dropdown menu={{ items: sizeItems }}>
          <ColumnHeightOutlined style={{ marginLeft: 12, fontSize: 16, color: 'rgba(0, 0, 0, 0.75)' }} />
        </Dropdown>
        <Popover content={filterContent} placement="bottomLeft" title="筛选列" trigger="click">
          <SettingOutlined style={{ marginLeft: 12, fontSize: 16 }} />
        </Popover>
      </>
    )
  }

  // 格式化数据
  let listData: Array<Record<string, any>> = data.list || []
  listData = listData.map((item: any, index: number) => ({
    ...item,
    _index: pageNumbering ? (pageNumbering === 'PAGED' ? (data.page - 1) * data.pageSize + index + 1 : index + 1) : null,
  }))

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
      if (column.onClick) currentColumn.render = (_: any, record: any) => <TableRowButton onClick={column.onClick}>{record[column.dataIndex]}</TableRowButton>
      tableColumns.push(currentColumn)
      return
    }

    if (!column.render) {
      if (column.onClick) {
        tableColumns.push({
          ...column,
          render: (text: any, record: any) => isDef(text) && text !== '' ? <TableRowButton onClick={column.onClick}>{column.maxLine ? <TextWithTooltip text={text} maxLine={column.maxLine}/> : text}</TableRowButton> : <span>{emptyValue}</span>,
          key: column.dataIndex
        })
      } else {
        tableColumns.push({
          ...column,
          render: (text: any) => isDef(text) && text !== '' ? <span>{column.maxLine ? <TextWithTooltip text={text} maxLine={column.maxLine}/> : text}</span> : <span>{emptyValue}</span>,
          key: column.dataIndex
        })
      }
    } else {
      tableColumns.push(column)
    }
  })

  // 使用缓存的宽度 & onCopy处理
  tableColumns = tableColumns.map((item) => ({
    ...item,
    width: tableCache?.columnsWidthMap?.[item.dataIndex] || item.width,
    onHeaderCell: (column: any) => ({
      width: column.width,
      onResize: handleResize(item),
    }),
    render: (text: any, record: any, index: number) => {
      const originalRender = item.render ? item.render(text, record, index) : text
      return (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {originalRender}
          {
            item.onCopy ?
              <Button
                type="link"
                icon={<CopyOutlined />}
                style={{ padding: '0 0 0 2px', width: 'auto' }}
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

  if (pageNumbering) {
    tableColumns.unshift({
      fixed: 'left',
      title: '序号',
      dataIndex: '_index',
      width: '60px'
    })
  }


  const antTableProps = {
    ...otherProps,
    rowKey,
    loading,
    columns: tableColumns,
    size: tableCache?.size || otherProps.size || 'small',
    scroll: otherProps.scroll || { x: 'max-content' },
    dataSource: listData,
    // 增加拖动调整宽度功能
    components: {
      header: {
        cell: TableResizableTitle
      }
    },
    pagination: otherProps.pagination || (data.total > data.pageSize ? {
      current: data.page,
      pageSize: data.pageSize,
      total: data.total,
      onChange: handlePagination,
      showSizeChanger: true
    } : false) as false | TablePaginationConfig
  }

  // 行可选
  if ((onSelectedRowKeysChange || onSelectedRowRecordsChange) && !antTableProps.rowSelection) {
    antTableProps.rowSelection = {
      selectedRowKeys: selectedRowKeys,
      onSelect: onTableSelect,
      onSelectAll: onTableSelectAll,
    }
  }

  return (
    <Card
      bordered={false}
      extra={buildExtra()}
      title={cardProps.title}
      style={cardProps.style}
    >
      <AntTable
        {...antTableProps}
      />
    </Card>
  )
})
