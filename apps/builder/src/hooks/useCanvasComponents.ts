import { createContext, useContext } from 'react'
import { ComponentConfig } from '../types'

interface CanvasContextType {
  components: ComponentConfig[]
}

export const CanvasContext = createContext<CanvasContextType>({
  components: []
})

export const useCanvasComponents = () => {
  const context = useContext(CanvasContext)
  return context.components
}