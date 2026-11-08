import { useEffect, useState } from 'react'

interface CountUpProps {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
}

export function CountUp({ end, duration = 1200, suffix = '', prefix = '' }: CountUpProps) {
  const isReduced = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
  const [count, setCount] = useState(() => (isReduced ? end : 0))

  useEffect(() => {
    if (isReduced) return

    const start = 0
    const frameRate = 1000 / 60
    const totalFrames = Math.round(duration / frameRate)
    let currentFrame = 0

    const timer = setInterval(() => {
      currentFrame++
      const progress = currentFrame / totalFrames
      const easeProgress = 1 - Math.pow(1 - progress, 4)
      const nextCount = Math.round(start + (end - start) * easeProgress)

      if (currentFrame >= totalFrames) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(nextCount)
      }
    }, frameRate)

    return () => clearInterval(timer)
  }, [end, duration, isReduced])

  return (
    <span className="count-up-number">
      {prefix}{count.toLocaleString('en-IN')}{suffix}
    </span>
  )
}
