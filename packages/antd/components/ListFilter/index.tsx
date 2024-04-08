import React, { CSSProperties, useEffect, useState } from 'react'
import { useQuery } from '@fundam/hooks'
import { convertObjectToNumbers } from '@fundam/utils'

import { useAntFormInstance } from '../../hooks/useAntFormInstance'
import { Card } from '../Card'
import { Form } from '../Form'
import { useAlias } from '../../hooks/useAlias';
import { TablePro } from '../TablePro';
import { updateURLWithRequestData } from '../../shared/utils'
import { useNavigate } from 'react-router'


interface ListFilterProps {
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
  tableOnSelectedRowRecordsChange
}) => {
  const [form] = useAntFormInstance()
  const tableAlias = useAlias<any>()
  const table = tableAlias?.[tableCacheKey]
  const [params, setParams] = useState<any>(null)
  const query: any = useQuery()
  const navigate = useNavigate()
  const { [tablePageKey]: initPage, [tablePageSizeKey]: initPageSize } = query

  useEffect(() => {
    // 非首次进入 或 不使用地址栏参数
    if (params || !updateQuery) return
    form.setFieldsValue(convertObjectToNumbers(query, queryToNumber))
    setParams(query)
  }, [query])

  const onFormFinish = async (values: Record<string, any> | null) => {
    const newQuery = { ...tableApiReqData, ...values, [tablePageKey]: 1 }
    updateQuery && updateURLWithRequestData(navigate, newQuery)
    await table.fetchData(newQuery)
  }

  const onPaginationChange = async (page: number, pageSize: number) => {
    const newQuery = { ...tableApiReqData, ...query, [tablePageKey]: page, [tablePageSizeKey]: pageSize }
    updateQuery && updateURLWithRequestData(navigate, newQuery)
    await table.fetchData(newQuery)
  }

  const onFormReset = async () => {
    form.resetFields()
    const newQuery = { ...tableApiReqData, [tablePageKey]: 1 }
    updateQuery && updateURLWithRequestData(navigate, newQuery, true)
    await table.fetchData(newQuery, true)
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
        updateQuery={updateQuery}
        indexType={tableIndexType}
        query={convertObjectToNumbers(query, queryToNumber)}
        initPage={parseInt(initPage || 1)}
        initPageSize={parseInt(initPageSize || 20)}
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
