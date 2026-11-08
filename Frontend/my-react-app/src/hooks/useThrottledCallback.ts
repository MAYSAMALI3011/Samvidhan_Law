import { useRef, useCallback, useState, useEffect } from 'react'

export interface ThrottledOptions {
  leading?: boolean
  trailing?: boolean
}

export function useThrottledCallback<Args extends unknown[], R = void>(
  callback: (...args: Args) => R,
  delay = 100,
  options: ThrottledOptions = { leading: true, trailing: true },
) {
  const lastExecTimeRef = useRef<number>(0)
  const timerRef = useRef<number | null>(null)
  const callbackRef = useRef<(...args: Args) => R>(callback)
  const lastArgsRef = useRef<Args | null>(null)
  const [isLocked, setIsLocked] = useState(false)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  const throttledFn = useCallback(
    (...args: Args) => {
      const now = Date.now()
      const elapsed = now - lastExecTimeRef.current
      lastArgsRef.current = args

      // Leading execution
      if (elapsed >= delay) {
        if (options.leading !== false) {
          lastExecTimeRef.current = now
          setIsLocked(true)
          callbackRef.current(...args)

          window.setTimeout(() => setIsLocked(false), delay)
          return
        }
      }

      // Trailing execution
      if (options.trailing !== false) {
        if (timerRef.current) window.clearTimeout(timerRef.current)

        timerRef.current = window.setTimeout(() => {
          lastExecTimeRef.current = Date.now()
          setIsLocked(false)
          if (lastArgsRef.current) {
            callbackRef.current(...lastArgsRef.current)
          }
        }, Math.max(0, delay - elapsed))
      }
    },
    [delay, options.leading, options.trailing],
  )

  const cancel = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setIsLocked(false)
  }, [])

  return {
    throttledFn,
    isLocked,
    cancel,
  }
}
