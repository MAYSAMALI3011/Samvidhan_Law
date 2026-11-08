import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/useTheme'

export interface KeyboardShortcutHandlers {
  onOpenShortcutsHelp?: () => void
  onOpenSearch?: () => void
  onToggleBookmark?: () => void
}

/**
 * Global Keyboard Shortcuts (Pattern 13):
 * - ? : Open shortcuts cheat sheet modal
 * - G then D : Navigate to /dashboard
 * - G then C : Navigate to /learn
 * - G then B : Navigate to /bookmarks
 * - B : Toggle bookmark
 * - T : Toggle theme (light/dark)
 * - / : Open search / command palette
 * Automatically ignores hotkeys when user is typing in form inputs, textareas, or contentEditable elements.
 */
export function useKeyboardShortcuts(handlers?: KeyboardShortcutHandlers) {
  const navigate = useNavigate()
  const { toggleTheme } = useTheme()
  const lastKeyRef = useRef<{ key: string; time: number } | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Never intercept when typing in inputs/textareas
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return
      }

      // Do not intercept if Meta or Ctrl are pressed (except for browser native combos)
      if (e.metaKey || e.ctrlKey) return

      const now = Date.now()
      const key = e.key

      // Two-key sequence check (e.g. G then D / C / B within 800ms)
      if (lastKeyRef.current && now - lastKeyRef.current.time < 800) {
        const prevKey = lastKeyRef.current.key.toLowerCase()
        if (prevKey === 'g') {
          if (key.toLowerCase() === 'd') {
            e.preventDefault()
            lastKeyRef.current = null
            navigate('/dashboard')
            return
          }
          if (key.toLowerCase() === 'c') {
            e.preventDefault()
            lastKeyRef.current = null
            navigate('/learn')
            return
          }
          if (key.toLowerCase() === 'b') {
            e.preventDefault()
            lastKeyRef.current = null
            navigate('/bookmarks')
            return
          }
        }
      }

      // Track 'g' for sequence
      if (key.toLowerCase() === 'g') {
        lastKeyRef.current = { key: 'g', time: now }
        return
      }

      // Single Key Shortcuts
      if (key === '?') {
        e.preventDefault()
        if (handlers?.onOpenShortcutsHelp) {
          handlers.onOpenShortcutsHelp()
        } else {
          window.dispatchEvent(new CustomEvent('samvidhan:open-shortcuts-help'))
        }
        return
      }

      if (key === '/') {
        e.preventDefault()
        if (handlers?.onOpenSearch) {
          handlers.onOpenSearch()
        } else {
          window.dispatchEvent(new CustomEvent('open-search-palette'))
        }
        return
      }

      if (key.toLowerCase() === 't') {
        e.preventDefault()
        toggleTheme()
        return
      }

      if (key.toLowerCase() === 'b') {
        e.preventDefault()
        if (handlers?.onToggleBookmark) {
          handlers.onToggleBookmark()
        } else {
          window.dispatchEvent(new CustomEvent('samvidhan:toggle-active-bookmark'))
        }
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate, toggleTheme, handlers])
}
