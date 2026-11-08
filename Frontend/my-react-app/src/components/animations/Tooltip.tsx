import { useState, useRef, useEffect, useId, type ReactNode } from 'react'

interface TooltipProps {
  content: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  children: ReactNode
  delay?: number
}

export function Tooltip({
  content,
  position = 'top',
  children,
  delay = 150,
}: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<number | null>(null)
  const id = useId()

  const show = () => {
    timerRef.current = window.setTimeout(() => {
      setVisible(true)
    }, delay)
  }

  const hide = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setVisible(false)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hide()
    }
    if (visible) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [visible])

  return (
    <div
      className="samvidhan-tooltip-wrapper"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <div aria-describedby={id} className="samvidhan-tooltip-trigger">
        {children}
      </div>
      {visible && (
        <div
          id={id}
          role="tooltip"
          className={`samvidhan-tooltip-popover tooltip-${position}`}
        >
          <div className="tooltip-arrow" aria-hidden="true" />
          <div className="tooltip-inner">{content}</div>
        </div>
      )}
    </div>
  )
}