import { useContext } from 'react'

import FormContext from '../shared/FormContext'

export default function () {
  const context = useContext(FormContext)
  if (!context) {
    throw new Error('useFunForm must be used within a FormProvider')
  }
  return context
}
