import { useState, useEffect, useRef, useCallback } from 'react'

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'offline'

export interface UseAutosaveOptions<T> {
  key: string
  value: T
  onSave?: (value: T) => Promise<void> | void
  debounceMs?: number
  enabled?: boolean
}

export function useAutosave<T>({
  key,
  value,
  onSave,
  debounceMs = 800,
  enabled = true,
}: UseAutosaveOptions<T>) {
  const [status, setStatus] = useState<AutosaveStatus>('idle')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const isInitialMount = useRef(true)
  const timerRef = useRef<number | null>(null)
  const latestValueRef = useRef(value)
  const isOnline = useRef(typeof navigator !== 'undefined' ? navigator.onLine : true)

  latestValueRef.current = value

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      isOnline.current = true
      // trigger sync if offline draft was pending
      triggerSave()
    }
    const handleOffline = () => {
      isOnline.current = false
      setStatus('offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Save execution
  const triggerSave = useCallback(async () => {
    const val = latestValueRef.current

    if (!isOnline.current) {
      // Save locally and mark as offline, will sync
      try {
        localStorage.setItem(`autosave:${key}`, JSON.stringify(val))
      } catch {}
      setStatus('offline')
      return
    }

    setStatus('saving')
    try {
      // Local persistence fallback
      localStorage.setItem(`autosave:${key}`, JSON.stringify(val))

      // Custom async save if provided
      if (onSave) {
        await onSave(val)
      }

      setStatus('saved')
      setLastSaved(new Date())

      // Reset to idle after 3 seconds of showing "Saved just now"
      timerRef.current = window.setTimeout(() => {
        setStatus('idle')
      }, 3000)
    } catch {
      setStatus('offline')
    }
  }, [key, onSave])

  // Watch for value changes and debounce
  useEffect(() => {
    if (!enabled) return

    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    setStatus('saving')
    if (timerRef.current) window.clearTimeout(timerRef.current)

    timerRef.current = window.setTimeout(() => {
      triggerSave()
    }, debounceMs)

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [value, debounceMs, enabled, triggerSave])

  // Warn before leaving if currently saving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (status === 'saving') {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [status])

  // Helper to load restored draft
  const getSavedDraft = useCallback((): T | null => {
    try {
      const raw = localStorage.getItem(`autosave:${key}`)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }, [key])

  // Helper to clear draft once submitted
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(`autosave:${key}`)
    } catch {}
    setStatus('idle')
  }, [key])

  return {
    status,
    lastSaved,
    getSavedDraft,
    clearDraft,
    forceSave: triggerSave,
  }
}
