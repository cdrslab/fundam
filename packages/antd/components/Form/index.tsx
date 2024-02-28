import React, { useState } from 'react'
import { Button, Form as AntForm, Row, Col } from 'antd'
import { FormProps as AntFormProps } from 'antd/es/form/Form'
import { FormInstance } from 'antd/es/form'

import './index.less'
import FormContext, { FormContextProps } from '../../shared/FormContext'
import { DownOutlined, UpOutlined } from '@ant-design/icons';

interface FormProviderProps extends Partial<Omit<FormContextProps, 'form'>>, Omit<AntFormProps, 'form'> {
  form: FormInstance
  children: React.ReactNode
  defaultButtonText?: string // 白色按钮文案，不传则不展示
  primaryButtonText?: string // 蓝色按钮文案，默认：提交
  collapseNames?: Array<string> // 收起的表单项（name区分）
}

export const Form: React.FC<FormProviderProps> = ({
  form,
  children,
  defaultButtonText,
  collapseNames = [],
  primaryButtonText = '提交',
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
  ...antProps
}) => {
  const [formCollapse, setFormCollapse] = useState(true) // 表单展开收起（默认收起）

  const providerValue = {
    form,
    direction,
    rowCol,
    showValidateMessagesRow,
    displayType,
    displayTextEmpty,
    collapseNames,
    formCollapse
  }

  const onFormFinish = (values: any) => {
    console.log(values)
    // TODO 待定
    onFinish && onFinish(values)
  }

  // TODO 读取项目中的 .funconfig 基础配置 或者类似 antd 的 config provider 处理，最终 merge 系统配置替换下面 { span: 6 }....，待实现
  const currentLabelCol = direction === 'vertical' ? labelCol || { span: 6 } : labelCol
  const currentWrapperCol = direction === 'vertical' ? wrapperCol || { span: 12 } : wrapperCol

  return (
    <FormContext.Provider value={providerValue}>
      <AntForm
        onFinish={onFormFinish}
        form={form}
        labelCol={currentLabelCol}
        wrapperCol={currentWrapperCol}
        {...antProps}
        className={showValidateMessagesRow ? '' : 'fun-form-validate-messages-row-hidden'}
      >
        {
          direction === 'horizontal' ?
            <Row gutter={[24, 12]}>
              {children}
              <Col span={6}>
                {
                  defaultButtonText ?
                    <Button type="default" style={{ marginRight: 8 }} onClick={() => form.resetFields()}>
                      {defaultButtonText}
                    </Button>
                    :
                    null
                }
                <Button type="primary" onClick={() => form.submit()}>
                  {primaryButtonText}
                </Button>
                {
                  collapseNames?.length ?
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
                <AntForm.Item label=" " colon={false}>
                  {
                    defaultButtonText ?
                      <Button type="default" style={{ marginRight: 8 }} onClick={() => form.resetFields()}>
                        {defaultButtonText}
                      </Button>
                      : null
                  }
                  <Button type="primary" onClick={() => form.submit()}>
                    {primaryButtonText}
                  </Button>
                </AntForm.Item>
              </>
            )
        }
      </AntForm>
    </FormContext.Provider>
  )
}
