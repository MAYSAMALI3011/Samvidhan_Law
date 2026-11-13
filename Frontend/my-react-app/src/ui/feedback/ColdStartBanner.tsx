import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'

/**
 * ColdStartBanner
 * Displays a friendly indicator when free-tier backend services are warming up.
 * Triggers if any fetch to the backend takes longer than 3.5 seconds.
 */
export function ColdStartBanner() {
  const [isWarmingUp, setIsWarmingUp] = useState(false)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null

    const handleFetchStart = (e: Event) => {
      const custom = e as CustomEvent<{ url?: string }>
      // Only watch backend API calls
      if (custom.detail?.url && custom.detail.url.includes('/api/')) {
        timer = setTimeout(() => {
          setIsWarmingUp(true)
        }, 3500)
      }
    }

    const handleFetchEnd = () => {
      if (timer) clearTimeout(timer)
      setIsWarmingUp(false)
    }

    window.addEventListener('samvidhan:fetch-start', handleFetchStart)
    window.addEventListener('samvidhan:fetch-end', handleFetchEnd)

    return () => {
      if (timer) clearTimeout(timer)
      window.removeEventListener('samvidhan:fetch-start', handleFetchStart)
      window.removeEventListener('samvidhan:fetch-end', handleFetchEnd)
    }
  }, [])

  if (!isWarmingUp) return null

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        background: 'var(--surface-sunken, #1e293b)',
        color: 'var(--text-secondary, #cbd5e1)',
        borderBottom: '1px solid var(--border, rgba(255, 255, 255, 0.1))',
        padding: '0.65rem 1rem',
        fontSize: '0.85rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.65rem',
        zIndex: 9998,
      }}
    >
      <RefreshCw size={15} className="spin" style={{ color: 'var(--gold, #d97706)' }} />
      <span>Waking up the server, this can take up to a minute (free tier cold start)...</span>
    </div>
  )
}
