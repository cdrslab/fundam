import React from 'react'
import { Form as AntForm, Row } from 'antd'
import { FormProps as AntFormProps } from 'antd/es/form/Form'

import './index.less'
import FormContext, { FormContextProps } from '../../shared/FormContext'

interface FormProviderProps extends Partial<Omit<FormContextProps, 'form'>>, Omit<AntFormProps, 'form'> {
  children: React.ReactNode
}

export const Form: React.FC<FormProviderProps> = ({
  children,
  // 注释说明见FormContextProps
  direction = 'horizontal',
  rowCol = 4,
  showValidateMessagesRow = true,
  onFinish,
  ...antProps
}) => {
  const [form] = AntForm.useForm()

  const providerValue = {
    form,
    direction,
    rowCol,
    showValidateMessagesRow
  }

  const onFormFinish = (values: any) => {
    // TODO 待定
    onFinish && onFinish(values)
  }

  let currentLabelCol
  let currentWrapperCol
  if (direction === 'vertical') {
    currentLabelCol = antProps.labelCol || { span: 6 }
    currentWrapperCol = antProps.wrapperCol || { span: 12 }
  }

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
