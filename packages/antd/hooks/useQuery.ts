import { useLocation } from 'react-router'
import queryString from 'query-string'

export function useQuery () {
  const location = useLocation()
  const searchString = location.search?.split('?')?.[1] || ''
  return searchString ? queryString.parse(searchString) : {}
}
