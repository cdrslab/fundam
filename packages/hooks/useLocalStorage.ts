import { useState, useEffect } from 'react'

const FUNDAM_LOCAL_CACHE_KEY = 'FUNDAM_LOCAL_CACHE_'

export function useLocalStorage<T>(key: string | undefined, initialValue: T | null): [T | null, (arg: T) => void] {
  if (!key) return [null, () => {}]

  const currentKey = FUNDAM_LOCAL_CACHE_KEY + key
  const readFromLocalStorage = () => {
    const storedValue = localStorage.getItem(currentKey)
    return storedValue ? JSON.parse(storedValue) : initialValue
  };

  const [storedValue, setStoredValue] = useState(readFromLocalStorage)

  useEffect(() => {
    localStorage.setItem(currentKey, JSON.stringify(storedValue))
  }, [currentKey, storedValue])

  return [storedValue, setStoredValue]
}
