import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string | undefined, initialValue: T | null): [T | null, (arg: T) => void] {
  if (!key) return [null, () => {}]

  const readFromLocalStorage = () => {
    const storedValue = localStorage.getItem(key)
    return storedValue ? JSON.parse(storedValue) : initialValue
  };

  const [storedValue, setStoredValue] = useState(readFromLocalStorage)

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(storedValue))
  }, [key, storedValue])

  return [storedValue, setStoredValue]
}
