import React, { CSSProperties, ReactNode, RefObject, useEffect, useRef, useState } from 'react'
import {
  Button,
  Card,
  Checkbox,
  Divider,
  Dropdown, Empty,
  Input,
  message,
  Popover,
  Space,
  Table as AntTable,
  Tooltip
} from 'antd'
import { CheckboxValueType } from 'antd/es/checkbox/Group'
import { useLocalStorage } from '@fundam/hooks'
import {
  CoffeeOutlined,
  ColumnHeightOutlined,
  CopyOutlined, PlusOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { get, union } from 'lodash'
import { isDef } from '@fundam/utils'
import { ButtonProps as AntButtonProps } from 'antd/es/button/button';
import { ColumnsType, ColumnType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import queryString from 'query-string';

import { TableProps, CacheTableData, TableRowButton } from '../Table'
import { useFun } from '../../hooks/useFun'
import { useAlias } from '../../hooks/useAlias'
import {
  arrayRemoveByValues,
  copyToClipboard, forceUpdateByPath, getData, objArrayRemoveByValuesKey, objArrayUnionByValuesKey,
  throttledAdjustButtonMargins
} from '../../shared/utils'
import { TableResizableTitle } from '../TableResizableTitle'
import { TextWithTooltip } from '../TextWithTooltip'

import './index.less'

export interface TableOperate {
  fetchData: (params: any, replace?: Boolean) => Promise<void>;
  refresh: () => Promise<void>;
}

interface TableProProps extends TableProps {
  tableRef?: RefObject<TableOperate>
  tableTitle?: string | Element | ReactNode // 标题
  extra?: ((props: any) => ReactNode) | ReactNode
  onPaginationChange?: (page: number, pageSize: number) => Promise<void>
  initSelectedRowKeys?: Array<any>
  selectedMaxRow?: number // 最多选择行数
  selectedMaxRowErrorMessage?: string // 超出选择行数限制
  onSelectedRowKeysChange?: (selectedRowKeys: Array<any>) => void
  onSelectedRowRecordsChange?: (selectedRowRecords: Array<any>) => void
  updateQueryParams?: (params: Record<string, any>) => void // 使用地址栏变更获取数据
  query?: Record<string, any>
  cardStyle?: CSSProperties
}

interface CacheTableProData extends CacheTableData {
  columnKeys?: Array<string> // 开启的列（未在columnKeys中的列会隐藏）
  size?: 'large' | 'middle' | 'small' // 表格大小
  quickQuery?: Array<{ key: string, label: any }> // 快捷查询
}

function cloneElementWithExtraFunc(
  element: ReactNode,
  refreshData: () => void,
  fetchData: () => void,
): ReactNode {
  if (
    React.isValidElement<AntButtonProps>(element) &&
    element.type === TableRowButton
  ) {
    return React.cloneElement(element, {
      ...element.props,
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        if (element.props.onClick) {
          // @ts-ignore
          element.props.onClick(e, { refreshData, fetchData });
        }
      },
    })
  }

  if (React.isValidElement(element) && element.props.children) {
    return React.cloneElement(element, {
      ...element.props,
      children: React.Children.map(element.props.children, (child) => cloneElementWithExtraFunc(child, refreshData, fetchData)),
    })
  }

  return element
}

// 注入 fetchData refreshData
function modifyColumnsWithExtra<T>(
  columns: ColumnsType<T>,
  refreshData: () => void,
  fetchData: () => void,
): ColumnsType<T> {
  return columns.map((column): ColumnType<T> => {
    const customRender = column.render;
    if (customRender) {
      return {
        ...column,
        render: (...params) => {
          const renderedElement = customRender(...params);
          return cloneElementWithExtraFunc(renderedElement as ReactNode, refreshData, fetchData);
        },
      };
    }
    return column;
  })
}

// TODO 0.2 优化：与 Table TableForm等抽出共性
export const TablePro: React.FC<TableProProps> = ({
  tableRef,
  updateQueryParams,
  query = {},
  cardStyle = {},
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
  onPaginationChange,
  initSelectedRowKeys = [],
  selectedMaxRow,
  selectedMaxRowErrorMessage = '超出限制',
  onSelectedRowKeysChange,
  onSelectedRowRecordsChange,

  rowKey = 'id',
  columns,

  children,
  ...funProps
}) => {
  const navigate = useNavigate()
  // 外部控制列展示
  const [selectFilterColumns, setSelectFilterColumns] = useState<string[]>([]) // 选中的筛选列
  const [currentColumns, setCurrentColumns] = useState(columns) // 渲染的列
  const [tableCache, setTableCache] = useLocalStorage<CacheTableProData>(cacheKey, null, 86400 * 30) // 30天过期
  const [loading, setLoading] = useState(funProps.loading || false) // 加载中
  const [quickQueryName, setQuickQueryName] = useState('') // 快捷查询名称
  const { request } = useFun()
  const { setAlias } = useAlias()
  const initRef = useRef(false)
  const cacheLastRequestParamsRef = useRef<any>({})
  const [data, setData] = useState({
    list: [],
    total: 0,
    page: initPage,
    pageSize: initPageSize
  })
  // Table选择相关
  const [selectedRowKeys, setSelectedRowKeys] = useState<Array<any>>(initSelectedRowKeys) // 选择的行key
  const [selectedRowRecords, setSelectedRowRecords] = useState<Array<any>>([]) // 临时存储

  useEffect(() => {
    // 换行按钮对齐
    throttledAdjustButtonMargins()
  }, [data])

  useEffect(() => {
    if (!tableRef) return
    // @ts-ignore
    tableRef.current = {
      fetchData: fetchData,
      refreshData: refreshData,
      handlePagination: handlePagination,
    }
  }, []);

  useEffect(() => {
    if (!initRef.current) {
      if (!updateQueryParams) {
        fetchData()
      } else {
        fetchData(query)
      }
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
  }, [])

  // 选择行变化
  useEffect(() => {
    onSelectedRowKeysChange && onSelectedRowKeysChange(selectedRowKeys)
  }, [selectedRowKeys])
  useEffect(() => {
    onSelectedRowRecordsChange && onSelectedRowRecordsChange(selectedRowRecords)
  }, [selectedRowRecords])

  const fetchData = async (params: any = {}, replace = false) => {
    if (!dataApi && !dataFunc) return
    try {
      setLoading(true)
      let requestData = replace ? { ...params } : {
        ...dataApiReqData,
        [pageKey]: initPage,
        [pageSizeKey]: initPageSize,
        ...params
      }
      if (dataApiMethod === 'get' && dataApi && updateQueryParams) {
        Object.keys(requestData).forEach((key: string) => {
          if (Array.isArray(requestData[key])) {
            requestData[key] = requestData[key].join(',')
          }
        })
      }
      cacheLastRequestParamsRef.current = { ...requestData }
      const res = await getData({
        dataApi,
        dataFunc,
        dataApiMethod,
        resDataPath,
        dataApiReqData: requestData,
      }, request)
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

  const handlePagination = async (page: number, pageSize: number) => {
    if (onPaginationChange) {
      await onPaginationChange(page, pageSize)
    } else {
      if (updateQueryParams) {
        updateQueryParams({ ...query, page: page, pageSize: pageSize })
      } else {
        await fetchData({ ...cacheLastRequestParamsRef.current, page, pageSize })
      }
    }
  }

  const refreshData = async () => {
    await fetchData(cacheLastRequestParamsRef.current)
  }

  const handleResize = (column: any) => {
    return (_e: any, { size }: any) => {
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
      if (column.onClick) currentColumn.render = (_: any, record: any) => <TableRowButton onClick={(e: any) => record.onClick(e, { fetchData, refreshData })}>{record[column.dataIndex]}</TableRowButton>
      tableColumns.push(currentColumn)
      return
    }

    if (!column.render) {
      if (column.onClick) {
        tableColumns.push({
          ...column,
          render: (text: any, record: any) => isDef(text) && text !== '' ? <TableRowButton onClick={(e: any) => record.onClick(e, { fetchData, refreshData })}>{column.maxLine ? <TextWithTooltip text={text} maxLine={column.maxLine}/> : text}</TableRowButton> : <span>{emptyValue}</span>,
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

  if (indexType) {
    tableColumns.unshift({
      fixed: 'left',
      title: '序号',
      dataIndex: '_index',
      width: '80px'
    })
  }

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
    columns: modifyColumnsWithExtra(tableColumns, refreshData, fetchData),
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

  if ((onSelectedRowKeysChange || onSelectedRowRecordsChange) && !renderProps.rowSelection) {
    // 需要行可选
    renderProps.rowSelection = {
      selectedRowKeys: selectedRowKeys,
      onSelect: onTableSelect,
      onSelectAll: onTableSelectAll,
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

  const navigateQuickQuery = async (path: string) => {
    try {
      if (!updateQueryParams) {
        await fetchData(queryString.parse(path.split('?')[1]), true)
      } else {
        navigate(path)
      }
    } catch (e) {
      message.error('快捷查询失败，请手动查询')
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
        {/*筛选自动填入*/}
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
          <CoffeeOutlined style={{ marginLeft: 12, fontSize: 16 }} onClick={refreshData} />
        </Dropdown>
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
      title={tableTitle as any}
      extra={buildExtra()}
      bordered={false}
      style={cardStyle}
    >
      <AntTable
        {...renderProps as any}
        size={tableCache?.size || 'small'}
      >
        {children}
      </AntTable>
    </Card>
  )
}
