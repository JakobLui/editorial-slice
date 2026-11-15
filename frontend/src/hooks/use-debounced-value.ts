import { useEffect, useState } from 'react'

/** The value, but only after it has stopped changing for `delayMs`. */
export function useDebouncedValue<T>(value: T, delayMs = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delayMs)

    return () => clearTimeout(timeout)
  }, [value, delayMs])

  return debouncedValue
}
