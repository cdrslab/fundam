import React, { CSSProperties, RefObject, useCallback, useEffect, useRef, useState } from 'react'
import { convertObjectToNumbers, isDef } from '@fundam/utils'
import { useSearchParams } from 'react-router-dom'
import { FormInstance } from 'antd/es/form'
import { isEqual } from 'lodash'

import { useAntFormInstance } from '../../hooks/useAntFormInstance'
import { Card } from '../Card'
import { Form } from '../Form'
import { useAlias } from '../../hooks/useAlias';
import { TableOperate, TablePro } from '../TablePro';
import { getQueryBySearchParams } from '../../shared/utils'

interface ListFilterProps {
  formRef: RefObject<FormInstance & {
    reset: () => Promise<void>
  }>, // 筛选form ref
  tableRef?: RefObject<TableOperate>, // 列表Table ref
  formProps?: Record<string, any> // 筛选表单Form的props
  useFormItemBorder?: boolean // 使用FormItem边框样式
  tableProps?: Record<string, any> // 表格 Table 的props
  tableTitle?: string
  tableCardStyle?: CSSProperties
  updateQuery?: Boolean // 更新地址栏参数
  queryToNumber?: Array<string> // 需要转换为number的query数组
  tableRowKey?: string
  formInCardTitle?: boolean // 将表单植入Card组件的title中
  formItems: React.ReactNode
  // 抽出常用的props
  tableIndexType?: 'pagination' | 'nonPagination'
  tableCacheKey: string, // 唯一key（localstorage缓存使用）
  tableColumns: Array<any>
  tableDataApi: string
  tableApiReqData?: Record<string, any>
  tableDataApiMethod?: 'get' | 'post' | 'delete' | 'put'
  tableResDataPath?: string
  tableExtra?: ((props: any) => React.ReactNode) | React.ReactNode
  tablePageKey?: string
  tableListKey?: string
  tablePageSizeKey?: string
  tableTotalKey?: string
  // 选择行相关
  tableInitSelectedRowKeys?: Array<any>
  tableSelectedMaxRow?: number
  tableSelectedMaxRowErrorMessage?: string
  tableOnSelectedRowKeysChange?: (selectedRowKeys: Array<any>) => void
  tableOnSelectedRowRecordsChange?: (selectedRowRecords: Array<any>) => void
}

export const ListFilter: React.FC<ListFilterProps> = ({
  formRef,
  tableRef,
  formProps = {},
  useFormItemBorder = false,
  tableProps = {},
  tableTitle = '',
  tableCardStyle = {},
  updateQuery = true,
  queryToNumber = [],
  tableRowKey = 'id',
  formInCardTitle = false,
  formItems,
  tableIndexType,
  tableCacheKey,
  tableColumns,
  tableDataApi,
  tableApiReqData = {},
  tableDataApiMethod = 'get',
  tableResDataPath,
  tableExtra,
  tablePageKey = 'page',
  tableListKey = 'list',
  tablePageSizeKey = 'pageSize',
  tableTotalKey = 'total',
  tableInitSelectedRowKeys,
  tableSelectedMaxRow,
  tableSelectedMaxRowErrorMessage,
  tableOnSelectedRowKeysChange,
  tableOnSelectedRowRecordsChange,
}) => {
  const [form] = useAntFormInstance()
  // const tableAlias = useAlias<any>()
  // const table = tableAlias?.[tableCacheKey]
  const currentTableRef = tableRef ? tableRef : React.useRef<TableOperate>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const { query, realQuery } = getQueryBySearchParams(searchParams, [tablePageKey, tablePageSizeKey, ...queryToNumber])
  const [initialized, setInitialized] = useState<Boolean>(false)
  const lastRequestParams = useRef<any>(null)

  useEffect(() => {
    if (!formRef) return
    // @ts-ignore
    formRef.current = {
      ...form,
      reset: onFormReset
    }
  }, [form, formRef])

  useEffect(() => {
    // 初始化
    if (!updateQuery || !currentTableRef.current || initialized) return
    setInitialized(true)
    form.resetFields()
    form.setFieldsValue(query)
    const newRequestParams = { ...tableApiReqData, ...query }
    currentTableRef.current.fetchData(newRequestParams, true)
    lastRequestParams.current = { ...newRequestParams }
  }, [])

  useEffect(() => {
    if (!lastRequestParams.current) return;
    // 使用 updateQuery 时，query改变即重新请求，防止重复请求
    const newRequestParams = { ...tableApiReqData, ...query }
    if (isEqual(lastRequestParams.current, newRequestParams)) return;
    lastRequestParams.current = { ...newRequestParams }
    currentTableRef.current && currentTableRef.current.fetchData(newRequestParams, true)
  }, [searchParams])

  const updateQueryParams = useCallback((params: any) => {
    const newParams: any = {}
    Object.keys(params).forEach((key: string) => {
      if (params[key] === 'undefined' || params[key] === 'null' || !isDef(params[key])) return
      newParams[key] = params[key]
    })
    setSearchParams(newParams)
  }, [setSearchParams])

  const onFormFinish = async (values: Record<string, any> | null) => {
    const newQuery = { ...query, ...values, [tablePageKey]: 1 }
    updateQuery && updateQueryParams({ ...newQuery })
    if (!updateQuery && currentTableRef.current) {
      await currentTableRef.current.fetchData(newQuery)
    }
  }

  const onPaginationChange = async (page: number, pageSize: number) => {
    const newQuery = { ...query, [tablePageKey]: page, [tablePageSizeKey]: pageSize }
    updateQuery && updateQueryParams({ ...newQuery })
    if (!updateQuery && currentTableRef.current) {
      await currentTableRef.current.fetchData(newQuery)
    }
  }

  const onFormReset = async () => {
    form.resetFields()
    const newQuery = { [tablePageKey]: 1 }
    updateQuery && updateQueryParams({ ...newQuery })
    if (!updateQuery && currentTableRef.current) {
      await currentTableRef.current.fetchData(newQuery, true)
    }
  }

  const buildTableTitle = () => {
    if (formInCardTitle) {
      return (
        <Form
          {...formProps}
          useFormItemBorder={useFormItemBorder}
          form={form}
          direction="horizontal"
          showValidateMessagesRow={false}
          defaultButtonText="重置"
          defaultButtonClick={onFormReset}
          primaryButtonText="查询"
          primaryButtonClick={() => form.submit()}
          onFinish={onFormFinish}
        >
          {formItems}
        </Form>
      )
    }
    return tableTitle
  }

  return (
    <div className="fun-list-filter">
      {
        !formInCardTitle ?
          <Card style={{ marginBottom: 24 }}>
            <Form
              {...formProps}
              useFormItemBorder={useFormItemBorder}
              form={form}
              direction="horizontal"
              showValidateMessagesRow={false}
              defaultButtonText="重置"
              defaultButtonClick={onFormReset}
              primaryButtonText="查询"
              primaryButtonClick={() => form.submit()}
              onFinish={onFormFinish}
            >
              {formItems}
            </Form>
          </Card> : null
      }
      <TablePro
        {...tableProps}
        updateQueryParams={updateQueryParams}
        tableRef={currentTableRef}
        indexType={tableIndexType}
        query={realQuery}
        initPage={query[tablePageKey]}
        initPageSize={query[tablePageSizeKey]}
        tableTitle={buildTableTitle()}
        cardStyle={tableCardStyle}
        cacheKey={tableCacheKey}
        alias={tableCacheKey}
        columns={tableColumns}
        dataApi={tableDataApi}
        dataApiReqData={tableApiReqData}
        dataApiMethod={tableDataApiMethod}
        resDataPath={tableResDataPath}
        rowKey={tableRowKey}
        extra={tableExtra}
        pageKey={tablePageKey}
        pageSizeKey={tablePageSizeKey}
        listKey={tableListKey}
        totalKey={tableTotalKey}
        onPaginationChange={onPaginationChange}
        initSelectedRowKeys={tableInitSelectedRowKeys}
        selectedMaxRow={tableSelectedMaxRow}
        selectedMaxRowErrorMessage={tableSelectedMaxRowErrorMessage}
        onSelectedRowKeysChange={tableOnSelectedRowKeysChange}
        onSelectedRowRecordsChange={tableOnSelectedRowRecordsChange}
      />
    </div>
  )
}
