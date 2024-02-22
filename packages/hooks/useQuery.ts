import { useLocation } from 'react-router'
import qs from 'qs'

export default function () {
  const location = useLocation()
  return qs.parse(location.search, { ignoreQueryPrefix: true })
}
