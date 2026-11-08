import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export function RouteProgressBar() {
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const t0 = setTimeout(() => {
      setLoading(true)
      setProgress(35)
    }, 10)
    const t1 = setTimeout(() => setProgress(70), 70)
    const t2 = setTimeout(() => setProgress(95), 140)
    const t3 = setTimeout(() => {
      setProgress(100)
      setTimeout(() => setLoading(false), 160)
    }, 220)
    return () => {
      clearTimeout(t0)
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [location.pathname])

  if (!loading) return null

  return (
    <div
      className="route-progress-bar"
      role="progressbar"
      aria-label="Page loading progress"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: progress + '%',
        height: '3px',
        background: 'linear-gradient(90deg, var(--gold), #f7e7b4, var(--gold))',
        boxShadow: '0 0 10px rgba(197, 160, 89, 0.7)',
        zIndex: 9999,
        transition: 'width 150ms cubic-bezier(0.22, 1, 0.36, 1), opacity 150ms ease',
        pointerEvents: 'none',
      }}
    />
  )
}