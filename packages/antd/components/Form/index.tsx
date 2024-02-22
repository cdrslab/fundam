import React from 'react'
import { Form as AntForm, Row } from 'antd'

import FormContext from '../../shared/FormContext'

interface FormProviderProps {
  children: React.ReactNode
  direction: 'horizontal' | 'vertical'
}

export const Form: React.FC<FormProviderProps> = ({ children, direction }) => {
  const [form] = AntForm.useForm()

  const providerValue = {
    form,
    direction,
  }

  return (
    <FormContext.Provider value={providerValue}>
      <AntForm form={form}>
        {
          direction === 'horizontal' ?
            <Row gutter={24}>
              {children}
            </Row>
            : children
        }
      </AntForm>
    </FormContext.Provider>
  )
}
