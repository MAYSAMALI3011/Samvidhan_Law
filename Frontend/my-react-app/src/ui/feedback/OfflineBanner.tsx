import { useState, useEffect } from 'react'
import { WifiOff, CheckCircle2 } from 'lucide-react'
import './feedback.css'

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [justReconnected, setJustReconnected] = useState(false)

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true)
      setJustReconnected(false)
    }

    const handleOnline = () => {
      setIsOffline(false)
      setJustReconnected(true)
      const timer = setTimeout(() => setJustReconnected(false), 3500)
      return () => clearTimeout(timer)
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  if (!isOffline && !justReconnected) return null

  return (
    <div
      className={`offline-banner-root ${justReconnected ? 'is-reconnected' : 'is-offline'}`}
      role="status"
      aria-live="polite"
    >
      <div className="offline-banner-content samvidhan-glow-card">
        {justReconnected ? (
          <>
            <CheckCircle2 size={16} className="text-emerald" aria-hidden="true" />
            <span>Connection restored! All progress synced.</span>
          </>
        ) : (
          <>
            <WifiOff size={16} className="text-amber" aria-hidden="true" />
            <span>You are offline. Your study notes and progress are saved locally.</span>
          </>
        )}
      </div>
    </div>
  )
}
