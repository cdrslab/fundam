import React, { RefObject, useEffect, useRef } from 'react'

import './index.less'
import { FunFormInstance } from '../../shared/types'
import { ProTable, ProTableInstance, ProTableProps } from '../ProTable'
import { useAntFormInstance } from '../../hooks/useAntFormInstance'
import { Card } from '../Card'
import { Form } from '../Form'
import { useQueryParams } from '../../hooks/useQueryParams'

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
  // Fun form 表单下面的内容
  formCardFooter?: React.ReactNode
  // Fun Card props
  tableCardProps?: Record<string, any>
  // 需要parse的query key，比如，传入：['page']，page: '1' => page: 1
  parseQueryKeys?: Array<string>
  // 需要在列表请求前格式化为数组的key
  parseArrayKeys?: string[]
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
    formCardFooter,
    tableCardProps = {},
    parseQueryKeys = [],
    parseArrayKeys = [],
    formInTableCardTitle,

    formUseFormItemBorder = false,
    formDirection = 'horizontal',
    formShowValidateMessagesRow = false,
    formDefaultButtonText = '重置',
    formPrimaryButtonText = '查询',
    tableRowKey = 'id',
    tablePageKey = 'page',
    tablePageSizeKey = 'pageSize',
    defaultPageSize = 20,
  } = props
  const queryParseValueKeys = [tableProps.pageKey || tablePageKey, tableProps.pageSizeKey || tablePageSizeKey, ...parseQueryKeys]
  const [form] = useAntFormInstance()
  // query：不含双下划线开头的隐藏字段，realQuery：含双下划线开头的隐藏字段
  const { query, realQuery, setQuery } = useQueryParams(queryParseValueKeys)
  const currentTableRef = tableRef || useRef<ProTableInstance>(null)

  useEffect(() => {
    if (formRef) {
      formRef.current = {
        ...form,
        reset: onFormReset,
      }
    }
    currentTableRef?.current?.fetch(query, true)

    // 数据回显
    // form.resetFields();
    // form.setFieldsValue({ ...realQuery });
  }, [])

  useEffect(() => {
    // 数据回显
    form.resetFields();
    form.setFieldsValue({ ...realQuery });
    // currentTableRef?.current?.fetch(query, true)
  }, [query])

  const onFormReset = async () => {
    form.resetFields()
    const newQuery = { [tablePageSizeKey]: defaultPageSize, [tablePageKey]: 1 }
    setQuery(newQuery, true)
    currentTableRef?.current?.fetch(newQuery, true)
  }

  const onFormFinish = async (values: Record<string, any> | null) => {
    const newQuery = { [tablePageSizeKey]: defaultPageSize, ...query, ...values, [tablePageKey]: 1 }
    setQuery(newQuery, true)
    currentTableRef?.current?.fetch(newQuery, true)
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
            {
              formCardFooter ?
                <div className="fun-form-card-footer">
                  {formCardFooter}
                </div>
                : null
            }
          </Card> : null
      }
      <ProTable
        needUpdateQuery
        parseQueryKeys={parseQueryKeys}
        cardProps={{
          ...tableCardProps,
          title: buildTableTitle()
        }}
        rowKey={tableRowKey}
        pageKey={tablePageKey}
        pageSizeKey={tablePageSizeKey}
        {...tableProps as any}
        ref={currentTableRef}
        parseArrayKeys={parseArrayKeys}
        cacheKey={cacheKey + '_ProTable'}
      />
    </div>
  )
}
