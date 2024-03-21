import { useState, useEffect } from 'react'

const FUNDAM_LOCAL_CACHE_KEY = 'FUNDAM_LOCAL_CACHE_'
const DEFAULT_EXPIRATION = 7 * 24 * 60 * 60

function useLocalStorage<T>(
  key: string | undefined,
  initialValue: T | null,
  expirationSec: number = DEFAULT_EXPIRATION
): [T | null, (arg: T) => void] {
  if (!key) return [null, () => {}]

  const currentKey = FUNDAM_LOCAL_CACHE_KEY + key
  const expirationKey = `${currentKey}_expiration`

  const readFromLocalStorage = () => {
    const storedValue = localStorage.getItem(currentKey)
    const storedExpiration = localStorage.getItem(expirationKey)

    if (!storedExpiration) {
      localStorage.removeItem(currentKey)
      return initialValue
    }

    if (storedExpiration && new Date().getTime() > Number(storedExpiration)) {
      localStorage.removeItem(currentKey)
      localStorage.removeItem(expirationKey)
      return initialValue
    }

    return storedValue ? JSON.parse(storedValue) : initialValue
  }

  const [storedValue, setStoredValue] = useState(readFromLocalStorage)

  useEffect(() => {
    const expirationTime = new Date().getTime() + expirationSec * 1000
    localStorage.setItem(currentKey, JSON.stringify(storedValue))
    localStorage.setItem(expirationKey, expirationTime.toString())
  }, [currentKey, storedValue, expirationSec])

  return [storedValue, setStoredValue]
}

export default useLocalStorage
