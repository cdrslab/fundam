import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

export function useQueryParams(parseKeys: string[] = []) {
  let [searchParams, setSearchParams] = useSearchParams()
  const query = useMemo(() => {
    const params: any = {}
    // @ts-ignore
    for (const [key, value] of searchParams) {
      if (!key.startsWith('__') && value !== 'undefined' && value !== 'null' && value !== undefined && value !== null) {
        try {
          if (parseKeys.includes(key)) {
            if (value.split(',')?.length > 1) {
              // 多选
              params[key] = value.split(',').map((item: any) => JSON.parse(item))
            } else {
              params[key] = JSON.parse(value)
            }
          } else {
            params[key] = value
          }
        } catch (e) {
          params[key] = value
        }
      }
    }
    return params
  }, [searchParams])

  const realQuery = useMemo(() => {
    const params: any = {}
    // @ts-ignore
    for (const [key, value] of searchParams) {
      if (value !== 'undefined' && value !== 'null' && value !== undefined && value !== null) {
        params[key] = value
      }
    }
    return params
  }, [searchParams])

  const setQuery = (newParams: Record<string, any>, replace?: boolean, routerOptions?: { replace?: boolean }) => {
    let nextParams: Record<string, string> = {}
    // @ts-ignore
    for (const key of searchParams.keys()) {
      if (newParams[key] === undefined) {
        nextParams[key] = searchParams.get(key) as string
      }
    }

    if (replace) {
      nextParams = newParams
    } else {
      for (const key in newParams) {
        const value = newParams[key]
        if (value !== undefined && value !== null) {
          nextParams[key] = String(value)
        }
      }
    }

    const newSearchParams = new URLSearchParams(nextParams)
    if (!isEqual(new URLSearchParams(searchParams), newSearchParams)) {
      setSearchParams(newSearchParams, routerOptions)
    }
  }

  return { query, realQuery, setQuery }
}
