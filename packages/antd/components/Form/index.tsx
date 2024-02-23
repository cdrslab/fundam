import React from 'react'
import { Form as AntForm, Row } from 'antd'

import FormContext from '../../shared/FormContext'

interface FormProviderProps {
  children: React.ReactNode
  direction: 'horizontal' | 'vertical'
  rowCol: 1 | 2 | 3 | 4 | 6 | 8 | 12 | 24
}

export const Form: React.FC<FormProviderProps> = ({
  children,
  direction,
  rowCol,
  ...antProps
}) => {
  const [form] = AntForm.useForm()

  const providerValue = {
    form,
    direction,
    rowCol,
  }

  return (
    <FormContext.Provider value={providerValue}>
      <AntForm form={form} {...antProps}>
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

Form.defaultProps = {
  direction: 'horizontal',
  rowCol: 4
}
