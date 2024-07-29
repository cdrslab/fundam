import React, { useState } from 'react'
import { Button, Form as AntForm, Row, Col, Dropdown } from 'antd'
import { FormProps as AntFormProps } from 'antd/es/form/Form'
import { FormInstance } from 'antd/es/form'
import { DownOutlined, UpOutlined } from '@ant-design/icons'

import './index.less'
import FormContext, { FormContextProps } from '../../shared/FormContext'
import { FunFormInstance } from '../../shared/types'
import { filterIgnoreFunValues } from '../../shared/utils'

interface FormProviderProps extends Partial<Omit<FormContextProps, 'form'>>, Omit<AntFormProps, 'form'> {
  form: FunFormInstance // 原因见 useAntFormInstance
  children: React.ReactNode
  defaultButtonText?: string // 白色按钮文案，不传则不展示
  defaultButtonClick?: (form: FunFormInstance) => void
  primaryButtonText?: string // 蓝色按钮文案，默认：提交
  primaryButtonClick?: (form: FunFormInstance) => Promise<void>
  collapseNames?: Array<string> // 收起的表单项（name区分）
  useFormItemBorder?: boolean // 使用FormItem边框样式
  buttonsLeftExtra?: React.ReactNode // 按钮组左侧添加自定义组件
  hiddenFormItems?: React.ReactNode // 嵌入的隐藏form items
  useLoading?: boolean // 使用loading
  loading?: boolean // 外部控制是否loading展示
}

export const Form: React.FC<FormProviderProps> = ({
  form,
  children,
  defaultButtonText,
  defaultButtonClick,
  collapseNames = [],
  primaryButtonText,
  primaryButtonClick,
  useFormItemBorder = false,
  // 注释说明见FormContextProps
  direction = 'horizontal',
  rowCol = 4,
  showValidateMessagesRow = true,
  displayType = 'default',
  displayTextEmpty = '-',
  // antd props
  onFinish,
  labelCol,
  wrapperCol,
  buttonsLeftExtra,
  hiddenFormItems,
  useLoading = true,
  loading = false,
  ...antProps
}) => {
  const [formCollapse, setFormCollapse] = useState(true) // 表单展开收起（默认收起）
  // loading展示
  const [primaryButtonLoading, setPrimaryButtonLoading] = useState(loading)

  const providerValue = {
    form,
    direction,
    rowCol,
    showValidateMessagesRow,
    displayType,
    displayTextEmpty,
    collapseNames,
    formCollapse: displayType === 'default' ? formCollapse : false // 置灰和text展示时，全部展示（除非手动设置某个FormItem为hidden）,并且不展示更多按钮
  }

  const onFormFinish = (values: any) => {
    onFinish && onFinish(filterIgnoreFunValues(values))
  }

  const onDefaultButtonClick = () => {
    defaultButtonClick && defaultButtonClick(form)
  }

  const onPrimaryButtonClick = async () => {
    try {
      console.log('-----xxxx')
      if (useLoading) setPrimaryButtonLoading(true)
      if (primaryButtonClick) await primaryButtonClick(form)
    } catch (e) {
      console.error(e)
    } finally {
      setPrimaryButtonLoading(false)
    }
  }

  // TODO 读取项目中的 .funconfig 基础配置 或者类似 antd 的 config provider 处理，最终 merge 系统配置替换下面 { span: 6 }....，待实现
  const currentLabelCol = direction === 'vertical' ? labelCol || { span: 6 } : labelCol
  const currentWrapperCol = direction === 'vertical' ? wrapperCol || { span: 12 } : wrapperCol

  const formCls = []
  if (!showValidateMessagesRow) {
    formCls.push('fun-form-validate-messages-row-hidden')
  }
  if (useFormItemBorder) {
    formCls.push('fun-form-item-border')
    antProps.variant = 'borderless'
  }

  return (
    <FormContext.Provider value={providerValue}>
      <AntForm
        onFinish={onFormFinish}
        form={form as FormInstance}
        labelCol={currentLabelCol}
        wrapperCol={currentWrapperCol}
        {...antProps}
        className={formCls as any}
      >
        {
          direction === 'horizontal' ?
            <Row gutter={[24, 12]}>
              {children}
              <Col span={buttonsLeftExtra ? 8 : 6}>
                {buttonsLeftExtra}
                {
                  primaryButtonText ?
                    <Button type="primary" style={{ marginRight: 8 }} onClick={onPrimaryButtonClick}>
                      {primaryButtonText}
                    </Button>
                    : null
                }
                {
                  defaultButtonText ?
                    <Button type="default" onClick={onDefaultButtonClick}>
                      {defaultButtonText}
                    </Button>
                    :
                    null
                }
                {
                  collapseNames?.length && displayType === 'default' ?
                    <Button type="link" style={{ paddingLeft: 8 }} onClick={() => setFormCollapse(!formCollapse)}>
                      更多
                      {
                        formCollapse ? <DownOutlined style={{ marginInlineStart: 0 }} /> : <UpOutlined style={{ marginInlineStart: 0 }} />
                      }
                    </Button>
                    :
                    null
                }
              </Col>
            </Row>
            : (
              <>
                {children}
                {
                  !defaultButtonText && !primaryButtonText ? null :
                    <AntForm.Item label=" " colon={false}>
                      {
                        defaultButtonText ?
                          <Button type="default" style={{ marginRight: 8 }} onClick={onDefaultButtonClick}>
                            {defaultButtonText}
                          </Button>
                          : null
                      }
                      {
                        primaryButtonText ?
                          <Button type="primary" onClick={onPrimaryButtonClick} loading={primaryButtonLoading}>
                            {primaryButtonText}
                          </Button>
                          : null
                      }
                    </AntForm.Item>
                }
              </>
            )
        }
        {hiddenFormItems}
      </AntForm>
    </FormContext.Provider>
  )
}
