import React from 'react'

export interface StreamCursorProps {
  visible?: boolean
  className?: string
  style?: React.CSSProperties
}

export function StreamCursor({ visible = true, className = '', style = {} }: StreamCursorProps) {
  if (!visible) return null

  return (
    <span
      className={`stream-cursor-dot ${className}`}
      style={style}
      aria-hidden="true"
    />
  )
}
