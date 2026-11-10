import { useState } from 'react'
import { useTheme } from '../../context/useTheme'
import { assetUrl } from '../../utils/assetUrl'

export interface BrandMarkProps {
  variant?: 'horizontal' | 'stacked' | 'icon'
  className?: string
  onDark?: boolean
  height?: number | string
  showTagline?: boolean
}

export function BrandMark({
  variant = 'horizontal',
  className = '',
  onDark,
  height,
}: BrandMarkProps) {
  const { theme } = useTheme()
  const [imgError, setImgError] = useState(false)

  const isDarkSurface = onDark || theme === 'dark'
  const textColor = isDarkSurface ? '#DCE3EF' : '#111522'
  const subColor = isDarkSurface ? '#B08D57' : '#536684'
  const goldColor = '#B08D57'

  // Resilient inline SVG fallback if external image fails or network is offline
  if (imgError) {
    if (variant === 'icon') {
      return (
        <svg
          className={className}
          width={height || 36}
          height={height || 36}
          viewBox="0 0 140 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Samvidhan"
        >
          <g stroke={goldColor} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M70 14 v58" />
            <circle cx="70" cy="14" r="6" fill={goldColor} stroke="none" />
            <path d="M36 28 h68" />
            <path d="M36 28 v14" />
            <path d="M104 28 v14" />
            <path d="M22 52 a16 11 0 1 0 32 0 a16 11 0 1 0 -32 0" />
            <path d="M86 52 a16 11 0 1 0 32 0 a16 11 0 1 0 -32 0" />
          </g>
          <rect x="60" y="70" width="20" height="22" rx="2" fill={goldColor} />
          <path
            d="M16 108 c28 -16 48 -16 54 2 6 -18 26 -18 54 -2 v24 c-28 -12 -48 -10 -54 6 -6 -16 -26 -18 -54 -6z"
            fill={textColor}
            stroke={goldColor}
            strokeWidth="4"
          />
        </svg>
      )
    }

    const calcWidth = typeof height === 'number' ? Math.round(Number(height) * 3.6) : 220
    const calcHeight = height || 60

    return (
      <svg
        className={className}
        width={calcWidth}
        height={calcHeight}
        viewBox="0 0 520 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Samvidhan – Indian law, made simple"
      >
        <g stroke={goldColor} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M70 14 v58" />
          <circle cx="70" cy="14" r="6" fill={goldColor} stroke="none" />
          <path d="M36 28 h68" />
          <path d="M36 28 v14" />
          <path d="M104 28 v14" />
          <path d="M22 52 a16 11 0 1 0 32 0 a16 11 0 1 0 -32 0" />
          <path d="M86 52 a16 11 0 1 0 32 0 a16 11 0 1 0 -32 0" />
        </g>
        <rect x="60" y="70" width="20" height="22" rx="2" fill={goldColor} />
        <path
          d="M16 108 c28 -16 48 -16 54 2 6 -18 26 -18 54 -2 v24 c-28 -12 -48 -10 -54 6 -6 -16 -26 -18 -54 -6z"
          fill={textColor}
          stroke={goldColor}
          strokeWidth="4"
        />
        <text x="168" y="78" fontFamily="Georgia, serif" fontSize="52" fill={textColor}>
          Samvidhan
        </text>
        <text
          x="172"
          y="108"
          fontFamily="Arial, sans-serif"
          fontSize="13"
          letterSpacing="3.2"
          fill={subColor}
        >
          INDIAN LAW, MADE SIMPLE
        </text>
      </svg>
    )
  }

  if (variant === 'icon') {
    return (
      <img
        className={className}
        src={assetUrl('/assets/brand/samvidhan-icon.svg')}
        width={height || 36}
        height={height || 36}
        alt="Samvidhan"
        onError={() => setImgError(true)}
      />
    )
  }

  if (variant === 'stacked') {
    return (
      <img
        className={className}
        src={assetUrl('/assets/brand/samvidhan-stacked.svg')}
        width={typeof height === 'number' ? Math.round(Number(height) * 1.8) : 160}
        height={typeof height === 'number' ? Math.round(Number(height) * 2) : 180}
        alt="Samvidhan – Indian law, made simple"
        onError={() => setImgError(true)}
      />
    )
  }

  const src = isDarkSurface
    ? assetUrl('/assets/brand/samvidhan-primary-dark.svg')
    : assetUrl('/assets/brand/samvidhan-primary-light.svg')

  return (
    <img
      className={className}
      src={src}
      width={typeof height === 'number' ? Math.round(Number(height) * 3.6) : 220}
      height={height || 60}
      alt="Samvidhan – Indian law, made simple"
      onError={() => setImgError(true)}
    />
  )
}
