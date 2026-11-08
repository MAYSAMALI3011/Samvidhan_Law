import { useState, useEffect, useRef } from 'react'

export interface UseDebouncedValueResult<T> {
  debouncedValue: T
  isDebouncing: boolean
  cancel: () => void
  getAbortSignal: () => AbortSignal
}

export function useDebouncedValue<T>(value: T, delay = 300): UseDebouncedValueResult<T> {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const abortControllerRef = useRef<AbortController>(new AbortController())
  const timerRef = useRef<number | null>(null)

  const isDebouncing = value !== debouncedValue

  useEffect(() => {
    // Abort previous stale request
    abortControllerRef.current.abort()
    abortControllerRef.current = new AbortController()

    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
    }

    timerRef.current = window.setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [value, delay])

  const cancel = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
    }
    abortControllerRef.current.abort()
    setDebouncedValue(value)
  }

  const getAbortSignal = () => abortControllerRef.current.signal

  return {
    debouncedValue,
    isDebouncing,
    cancel,
    getAbortSignal,
  }
}
