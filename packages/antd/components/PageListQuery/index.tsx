import React, { RefObject, useCallback, useEffect, useMemo, useRef } from 'react'

import { FunFormInstance } from '../../shared/types'
import { ProTable, ProTableColumnProps, ProTableInstance, ProTableProps } from '../ProTable'
import { useAntFormInstance } from '../../hooks/useAntFormInstance'
import { useSearchParams } from 'react-router-dom';
import { getQueryBySearchParams } from '../../shared/utils';
import { Card } from '../Card'
import { Form } from '../Form'
import { isDef } from '@fundam/utils';
import queryString from 'query-string';

interface PageListQueryProps {
  // 筛选表单项
  formItems: React.ReactNode
  // 缓存key
  cacheKey?: string
  // Fun Table props
  tableProps: Omit<ProTableProps<any>, 'cacheKey' | 'rowKey'> & {
    rowKey?: string
    cacheKey?: string
  }
  // 允许外层直接操作form
  formRef?: RefObject<FunFormInstance & {
    reset: () => Promise<void>
  }>
  // 允许外层直接操作table
  tableRef?: RefObject<ProTableInstance>
  // Fun Form props
  formProps?: Record<string, any>
  // Fun Card props
  formCardProps?: Record<string, any>
  // Fun Card props
  tableCardProps?: Record<string, any>
  // 需要parse的query key，比如，传入：['page']，page: '1' => page: 1
  parseQueryKeys?: Array<string>
  // 将表单插入table card的左侧标题处
  formInTableCardTitle?: boolean
  // 需要设置默认值的form or table props
  formUseFormItemBorder?: boolean
  formDirection?: 'horizontal' | 'vertical'
  formShowValidateMessagesRow?: boolean
  formDefaultButtonText?: string
  formPrimaryButtonText?: string
  tableRowKey?: string
  tablePageKey?: string
  tablePageSizeKey?: string
  defaultPageSize?: number
}

export const PageListQuery: React.FC<PageListQueryProps> = (props) => {
  const {
    formItems,
    cacheKey = window.location.pathname,
    formRef,
    tableRef,
    formProps = {},
    tableProps = {} as any,
    formCardProps = {},
    tableCardProps = {},
    parseQueryKeys = [],
    formInTableCardTitle,

    formUseFormItemBorder = false,
    formDirection = 'horizontal',
    formShowValidateMessagesRow = false,
    formDefaultButtonText = '重置',
    formPrimaryButtonText = '查询',
    tableRowKey = 'id',
    tablePageKey = 'page',
    tablePageSizeKey = 'pageSize',
    defaultPageSize = 20
  } = props
  const queryParseValueKeys = [tableProps.pageKey || tablePageKey, tableProps.pageSizeKey || tablePageSizeKey, ...parseQueryKeys]
  const [form] = useAntFormInstance()
  const [searchParams, setSearchParams] = useSearchParams()
  // query：不含双下划线开头的隐藏字段，realQuery：含双下划线开头的隐藏字段
  const { query, realQuery } = useMemo(() => getQueryBySearchParams(searchParams, queryParseValueKeys), [searchParams])
  const currentTableRef = tableRef || useRef<ProTableInstance>(null)

  useEffect(() => {
    if (formRef) {
      formRef.current = {
        ...form,
        reset: onFormReset,
      }
    }
  }, [])

  useEffect(() => {
    // 数据回显
    form.resetFields()
    form.setFieldsValue({ ...query })
    currentTableRef?.current?.fetch(query, true)
  }, [query])

  // 设置query
  const updateQueryParams = useCallback((params: any) => {
    const newParams: any = {}
    Object.keys(params).forEach((key: string) => {
      if (params[key] === 'undefined' || params[key] === 'null' || !isDef(params[key])) return
      newParams[key] = params[key]
    })
    setSearchParams(newParams)
  }, [setSearchParams])

  const updateQueryAndFetch = (search: Record<string, any> | string) => {
    if (typeof search === 'string') {
      search = queryString.parse(search.split('?')[1])
    }
    updateQueryParams({ ...search })
  }

  const onFormReset = async () => {
    form.resetFields()
    const newQuery = { [tablePageSizeKey]: defaultPageSize, [tablePageKey]: 1 }
    updateQueryAndFetch(newQuery)
  }

  const onFormFinish = async (values: Record<string, any> | null) => {
    const newQuery = { [tablePageSizeKey]: defaultPageSize, ...query, ...values, [tablePageKey]: 1 }
    updateQueryAndFetch(newQuery)
  }

  // 完善Form props
  const currentFormProps = {
    ...formProps,
    defaultButtonClick: formProps.defaultButtonClick || onFormReset,
    primaryButtonClick: formProps.primaryButtonClick || (() => form.submit()),
    onFinish: onFormFinish
  }

  const buildTableTitle = () => {
    if (formInTableCardTitle) {
      return (
        <Form
          useFormItemBorder={formUseFormItemBorder}
          direction={formDirection}
          showValidateMessagesRow={formShowValidateMessagesRow}
          defaultButtonText={formDefaultButtonText}
          primaryButtonText={formPrimaryButtonText}
          {...currentFormProps}
          form={form}
        >
          {formItems}
        </Form>
      )
    }
    return tableCardProps.title
  }

  return (
    <div className="fun-page-list-query">
      {
        !formInTableCardTitle ?
          <Card
            {...formCardProps}
            style={{
              marginBottom: 24,
              ...(formCardProps?.style || {})
            }}
          >
            <Form
              useFormItemBorder={formUseFormItemBorder}
              direction={formDirection}
              showValidateMessagesRow={formShowValidateMessagesRow}
              defaultButtonText={formDefaultButtonText}
              primaryButtonText={formPrimaryButtonText}
              {...currentFormProps}
              form={form}
            >
              {formItems}
            </Form>
          </Card> : null
      }
      <ProTable
        useQuery
        updateQueryAndFetch={updateQueryAndFetch}
        cardProps={{
          ...tableCardProps,
          title: buildTableTitle()
        }}
        rowKey={tableRowKey}
        pageKey={tablePageKey}
        pageSizeKey={tablePageSizeKey}
        {...tableProps as any}
        ref={currentTableRef}
        cacheKey={cacheKey + '_ProTable'}
      />
    </div>
  )
}
