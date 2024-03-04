import { useContext } from 'react'

import ConfigContext from '../shared/ConfigContext'

export default function () {
  const context = useContext(ConfigContext)
  if (!context) {
    throw new Error('useFun must be used within a FunConfigProvider')
  }
  return context
}
