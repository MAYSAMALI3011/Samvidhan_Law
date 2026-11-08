import React, { useRef, useState, useEffect } from 'react'

interface RevealProps {
  children: React.ReactNode
  delay?: number // in ms, e.g. 80, 160
  className?: string
  distance?: number // e.g. 20px
}

export function Reveal({
  children,
  delay = 0,
  className = '',
  distance = 20,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const isReduced = useRef(false)

  useEffect(() => {
    isReduced.current =
      typeof window !== 'undefined' &&
      (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        document.documentElement.classList.contains('reduced-motion'))

    if (isReduced.current) {
      setIsVisible(true)
      return
    }

    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`reveal-element ${isVisible ? 'is-visible' : ''} ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        '--reveal-y': `${distance}px`,
      } as React.CSSProperties}
    >
      {children}
    </div>
  )
}
