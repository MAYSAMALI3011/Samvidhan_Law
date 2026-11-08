import { createContext } from 'react'

export type ThemeMode = 'system' | 'light' | 'dark'
export type ActiveTheme = 'light' | 'dark'

export interface ThemeContextValue {
  themeMode: ThemeMode
  activeTheme: ActiveTheme
  setThemeMode: (mode: ThemeMode) => void
  /** For backwards compatibility */
  theme: ActiveTheme
  setTheme: (theme: ActiveTheme) => void
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
