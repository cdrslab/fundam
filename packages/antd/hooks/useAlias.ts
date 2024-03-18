import { useCallback } from 'react'
import { useFun } from './useFun'

export interface AliasBaseFunc {
  set: (name: string, value: any) => void
  get: (name: string) => any
}

export function useAlias<T>() {
  const { setAlias, getAlias, getAllAlias } = useFun()

  const set = useCallback((name: string, value: any) => {
    setAlias?.(name, value)
  }, [setAlias])

  const get = useCallback((name: string) => {
    return getAlias?.(name)
  }, [getAlias])

  return { setAlias: set, getAlias: get, ...(getAllAlias?.() || {}) } as AliasBaseFunc & T
}
