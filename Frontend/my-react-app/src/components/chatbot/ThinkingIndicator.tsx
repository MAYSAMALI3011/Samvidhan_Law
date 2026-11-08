import { useState, useEffect } from 'react'
import { Mor } from '../mascot/Mor'

export function ThinkingIndicator() {
  const [label, setLabel] = useState('Thinking...')

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setLabel('Thinking through statutory principles...')
    }, 600)

    const timer2 = setTimeout(() => {
      setLabel('Still working on it, referencing constitutional precedents...')
    }, 6000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  return (
    <div className="chat-thinking-box" aria-live="polite">
      <div className="thinking-eye-pulse" style={{ display: 'inline-flex', alignItems: 'center' }}>
        <Mor mood="reading" size={26} decorative />
      </div>
      <span className="thinking-shimmer-line">{label}</span>
    </div>
  )
}
