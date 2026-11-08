import { useState, useEffect } from 'react'

export function GlobalCursorGlow() {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const [isReduced] = useState(() => {
    if (typeof window === 'undefined') return false
    return (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.classList.contains('reduced-motion')
    )
  })

  useEffect(() => {
    if (isReduced) return

    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY })
    }

    const handleMouseLeave = () => {
      setPos(null)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [isReduced])

  if (!pos || isReduced) return null

  return (
    <div
      className="global-page-cursor-glow"
      style={{
        background: `radial-gradient(750px circle at ${pos.x}px ${pos.y}px, rgba(197, 160, 89, 0.08) 0%, rgba(197, 160, 89, 0.02) 45%, transparent 75%)`,
      }}
      aria-hidden="true"
    />
  )
}
