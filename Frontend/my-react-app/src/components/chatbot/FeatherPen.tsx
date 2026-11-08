import React from 'react'
import { StreamCursor } from './StreamCursor'

export interface FeatherPenProps {
  isWriting?: boolean
  isThinking?: boolean
  reducedMotion?: boolean
  className?: string
  style?: React.CSSProperties
}

const leftLoop = 'M 48.5,73.5 C 38.2,74.8 24.1,72.4 17.5,63.2 C 10.2,53.0 11.4,36.8 20.8,27.2 C 28.6,19.2 41.5,18.4 51.2,24.1 C 44.8,23.8 34.6,26.5 28.2,32.4 C 20.5,39.5 19.8,51.8 25.4,59.8 C 30.2,66.6 40.5,68.8 49.2,67.1 C 49.0,69.2 48.8,71.4 48.5,73.5 Z'
const rightBlade = 'M 48.2,23.2 C 55.4,18.8 65.8,19.2 72.8,24.4 C 80.5,30.1 86.8,39.2 88.5,48.5 C 83.2,46.1 76.5,45.8 71.2,48.8 C 76.4,52.2 81.2,57.4 83.4,63.2 C 77.8,61.8 71.5,62.4 66.8,66.1 C 71.2,70.5 74.5,76.8 74.8,83.2 C 67.2,77.5 58.5,71.2 51.8,63.5 C 47.2,58.2 44.5,50.8 44.8,43.2 C 45.1,35.5 46.2,28.8 48.2,23.2 Z'
const quillStem = 'M 53.2,64.8 C 46.8,72.2 38.5,79.8 28.5,84.5 C 20.8,88.1 11.8,89.5 4.5,88.2 C 12.8,86.2 21.5,81.8 28.2,76.5 C 36.8,69.8 44.2,60.8 48.8,50.8 C 49.2,53.8 50.8,60.1 53.2,64.8 Z'

export function FeatherPen({
  isWriting = true,
  isThinking = false,
  reducedMotion = false,
  className = '',
  style = {},
}: FeatherPenProps) {
  if (reducedMotion) {
    return (
      <span className="feather-pen-static" style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '4px' }}>
        <StreamCursor visible={true} />
      </span>
    )
  }

  return (
    <span
      className={`feather-pen-layer ${isThinking ? 'thinking-feather-pulse' : ''} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        verticalAlign: 'middle',
        position: 'relative',
        marginLeft: '4px',
        ...style,
      }}
      aria-hidden="true"
    >
      {/* 20px Mini Plume Pen */}
      <span className={`feather-pen-quill ${isWriting ? 'feather-pen-wobble' : ''}`}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d={quillStem} fill="#B08D57" stroke="#B08D57" strokeWidth="3" />
          <path d={leftLoop} fill="#B08D57" />
          <path d={rightBlade} fill="#F7F3E8" />
          {/* Glowing Orange Insertion Point */}
          <circle cx="48" cy="53" r="6" fill="#E89B45" />
        </svg>
      </span>

      {/* Exact Blinking Dot Cursor at the tip of the quill */}
      <StreamCursor visible={true} style={{ position: 'absolute', bottom: '2px', left: '16px' }} />
    </span>
  )
}
