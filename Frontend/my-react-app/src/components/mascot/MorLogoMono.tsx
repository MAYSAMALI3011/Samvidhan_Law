import React from 'react'

export interface MorLogoMonoProps {
  size?: number
  color?: string
  className?: string
  style?: React.CSSProperties
  'aria-label'?: string
  decorative?: boolean
}

export function MorLogoMono({
  size = 48,
  color = 'currentColor',
  className = '',
  style = {},
  'aria-label': ariaLabel = "Mor the Peacock mascot emblem",
  decorative = false,
}: MorLogoMonoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill={color}
      className={`mor-logo-mono ${className}`}
      style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative ? true : undefined}
    >
      {/* Outer Ring */}
      <circle cx="32" cy="32" r="30" fill="none" stroke={color} strokeWidth="2.5" />

      {/* 3-Feather Crest */}
      <path d="M32 22 C27 16 22 10 20 6" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M32 22 C32 15 32 9 32 4" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M32 22 C37 16 42 10 44 6" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="20" cy="6" r="2.5" fill={color} />
      <circle cx="32" cy="4" r="3" fill={color} />
      <circle cx="44" cy="6" r="2.5" fill={color} />

      {/* Head & Neck Profile */}
      <path d="M22 40 C21 30 24 23 30 22 C37 21 42 26 42 35 C42 43 38 48 35 56 L27 56 C24 49 22 45 22 40 Z" fill={color} />

      {/* Negative Space Eye */}
      <ellipse cx="32" cy="30" rx="3" ry="3.5" fill="var(--canvas, #0B1426)" />
      <circle cx="31" cy="29" r="1.2" fill={color} />

      {/* Negative Space Facial Stripe */}
      <path d="M26 27 C28 25 32 26 35 28" fill="none" stroke="var(--canvas, #0B1426)" strokeWidth="1.5" strokeLinecap="round" />

      {/* Beak */}
      <path d="M42 30 Q51 34 42 37 Z" fill={color} />
    </svg>
  )
}
