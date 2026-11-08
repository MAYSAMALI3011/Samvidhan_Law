import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ThemeContext, type ThemeMode, type ActiveTheme } from './ThemeState'

const STORAGE_KEY = 'samvidhan-theme-preference'

function getSystemTheme(): ActiveTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getStoredMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system'
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'dark' || saved === 'light') return saved
    return 'system'
  } catch {
    return 'system'
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(getStoredMode)
  const [systemTheme, setSystemTheme] = useState<ActiveTheme>(getSystemTheme)

  // Listen to OS theme change in real-time
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Resolve active theme: explicit light/dark, or system
  const activeTheme: ActiveTheme = themeMode === 'system' ? systemTheme : themeMode

  // Apply resolved theme attribute and colorScheme to <html>
  useEffect(() => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    root.setAttribute('data-theme', activeTheme)
    root.style.colorScheme = activeTheme

    // Save preference
    try {
      if (themeMode === 'system') {
        localStorage.removeItem(STORAGE_KEY)
      } else {
        localStorage.setItem(STORAGE_KEY, themeMode)
      }
      localStorage.setItem('samvidhan-theme', activeTheme)
    } catch {
      // storage quota or incognito fallback
    }
  }, [activeTheme, themeMode])

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode)
  }, [])

  // Backwards compatibility functions
  const setTheme = useCallback((theme: ActiveTheme) => {
    setThemeModeState(theme)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeModeState((prev) => {
      const current = prev === 'system' ? systemTheme : prev
      return current === 'light' ? 'dark' : 'light'
    })
  }, [systemTheme])

  const value = useMemo(
    () => ({
      themeMode,
      activeTheme,
      setThemeMode,
      theme: activeTheme,
      setTheme,
      toggleTheme,
    }),
    [themeMode, activeTheme, setThemeMode, setTheme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
