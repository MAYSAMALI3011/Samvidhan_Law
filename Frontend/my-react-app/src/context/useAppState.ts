import { useContext } from 'react'
import { AppStateContext } from './AppState'
import type { AppState } from './AppState'

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}
