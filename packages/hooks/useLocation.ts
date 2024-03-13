import { useState, useEffect } from 'react'

interface LocationState {
  pathname: string
  search: string
  hash: string
}

const useLocation = (): LocationState => {
  const [location, setLocation] = useState<LocationState>({
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
  })

  useEffect(() => {
    const handleLocationChange = () => {
      setLocation({
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
      })
    }

    window.addEventListener('popstate', handleLocationChange)
    window.addEventListener('hashchange', handleLocationChange)

    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      window.removeEventListener('hashchange', handleLocationChange)
    }
  }, [])

  return location
};

export default useLocation
