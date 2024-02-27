import React from 'react'
import { Form as AntForm, Row } from 'antd'
import { FormProps as AntFormProps } from 'antd/es/form/Form'
import { FormInstance } from 'antd/es/form'

import './index.less'
import FormContext, { FormContextProps } from '../../shared/FormContext'

interface FormProviderProps extends Partial<Omit<FormContextProps, 'form'>>, Omit<AntFormProps, 'form'> {
  form: FormInstance
  children: React.ReactNode
}

export const Form: React.FC<FormProviderProps> = ({
  form,
  children,
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

  const providerValue = {
    form,
    direction,
    rowCol,
    showValidateMessagesRow,
    displayType,
    displayTextEmpty
  }

  const onFormFinish = (values: any) => {
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
            </Row>
            : children
        }
      </AntForm>
    </FormContext.Provider>
  )
}
