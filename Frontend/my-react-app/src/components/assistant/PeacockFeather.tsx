import React from 'react'

interface PeacockFeatherProps {
  size?: number | 'sm' | 'md' | 'lg'
  className?: string
  animated?: boolean
  style?: React.CSSProperties
}

export function PeacockFeather({
  size = 28,
  className = '',
  animated = false,
  style = {},
}: PeacockFeatherProps) {
  const pixelSize =
    size === 'sm' ? 16 : size === 'md' ? 28 : size === 'lg' ? 56 : typeof size === 'number' ? size : 28

  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`peacock-feather-svg ${animated ? 'feather-sway-anim' : ''} ${className}`}
      style={style}
      aria-hidden="true"
    >
      <defs>
        {/* Outer Aura Glow */}
        <filter id="goldAura" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Stem Quill Gradient */}
        <linearGradient id="quillGrad" x1="12" y1="56" x2="48" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#DFBA73" />
          <stop offset="40%" stopColor="#B08D57" />
          <stop offset="100%" stopColor="#E2C992" />
        </linearGradient>

        {/* Eye Outer Ring (Deep Sapphire / Navy) */}
        <radialGradient id="eyeOuter" cx="42" cy="20" r="14" fx="39" fy="17" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0B1A30" />
          <stop offset="70%" stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#DFBA73" stopOpacity="0.8" />
        </radialGradient>

        {/* Eye Middle Ring (Peacock Teal / Cyan) */}
        <radialGradient id="eyeTeal" cx="42" cy="20" r="9" fx="40" fy="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#065F46" />
          <stop offset="60%" stopColor="#0D9488" />
          <stop offset="100%" stopColor="#14B8A6" />
        </radialGradient>

        {/* Eye Inner Center (Emerald & Imperial Gold) */}
        <radialGradient id="eyeGoldCenter" cx="42" cy="20" r="4.5" fx="41" fy="19" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="65%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#047857" />
        </radialGradient>
      </defs>

      {/* 1. Fine Feather Barbs (Soft Radiant Plumage) */}
      <g opacity="0.85">
        {/* Left side barbs */}
        <path d="M18 50 C24 46, 28 38, 34 32" stroke="#0D9488" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        <path d="M22 45 C28 40, 32 32, 38 27" stroke="#10B981" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
        <path d="M26 39 C31 34, 35 27, 40 22" stroke="#34D399" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
        <path d="M30 33 C34 28, 38 23, 42 19" stroke="#DFBA73" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />

        {/* Right side barbs */}
        <path d="M22 52 C28 50, 35 46, 42 42" stroke="#0D9488" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        <path d="M26 46 C32 43, 39 38, 46 34" stroke="#1E3A8A" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
        <path d="M30 40 C36 36, 43 31, 50 26" stroke="#2563EB" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
        <path d="M34 34 C40 30, 46 24, 52 19" stroke="#DFBA73" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
      </g>

      {/* 2. Curved Stem Quill (Gilded Spine) */}
      <path
        d="M12 56 C20 46, 32 34, 46 16"
        stroke="url(#quillGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* 3. The Peacock Feather Eye (Layered Rings) */}
      {/* Outer Golden Halo Halo Ring */}
      <ellipse cx="43" cy="20" rx="14" ry="11" transform="rotate(-30 43 20)" fill="url(#eyeOuter)" stroke="#DFBA73" strokeWidth="1" />

      {/* Middle Peacock Teal Plumage Ring */}
      <ellipse cx="43" cy="20" rx="9.5" ry="7.5" transform="rotate(-30 43 20)" fill="url(#eyeTeal)" />

      {/* Inner Emerald & Gold Heart Disc */}
      <ellipse cx="43" cy="20" rx="5.5" ry="4" transform="rotate(-30 43 20)" fill="url(#eyeGoldCenter)" />

      {/* Pin-point Diamond Sparkle Highlight in center */}
      <circle cx="41.5" cy="18.5" r="1.3" fill="#FFFFFF" opacity="0.95" />
    </svg>
  )
}

/**
 * Minimalist refined Indian Peacock Silhouette for empty state / welcome art.
 */
export function PeacockSilhouette({ size = 96, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`peacock-silhouette-svg ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="peacockBodyGrad" x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#DFBA73" />
          <stop offset="35%" stopColor="#0D9488" />
          <stop offset="70%" stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#0B1526" />
        </linearGradient>
      </defs>

      {/* Radiant Crest Plumes */}
      <path d="M56 22 L52 14 M60 21 L60 12 M64 22 L68 14" stroke="#DFBA73" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
      <circle cx="52" cy="13" r="1.8" fill="#DFBA73" />
      <circle cx="60" cy="11" r="1.8" fill="#DFBA73" />
      <circle cx="68" cy="13" r="1.8" fill="#DFBA73" />

      {/* Slender Royal Neck & Head */}
      <path
        d="M60 24 C55 24 51 28 52 33 C53 38 57 44 58 50 C59 56 55 64 50 70 C44 77 36 84 32 94 C42 96 56 94 66 88 C76 82 84 72 88 60 C90 52 88 44 82 38 C76 32 68 24 60 24 Z"
        fill="url(#peacockBodyGrad)"
        opacity="0.92"
      />

      {/* Fan of Gilded Plumage Arcs */}
      <path d="M48 68 C35 55 30 38 40 25 C50 12 70 14 80 25" stroke="#DFBA73" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.45" />
      <path d="M52 74 C40 62 36 45 46 32 C56 19 76 21 86 32" stroke="#0D9488" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.5" />
      <path d="M56 80 C44 68 40 52 50 38 C60 25 80 27 92 38" stroke="#10B981" strokeWidth="1.2" opacity="0.4" />

      {/* Eye of the Peacock */}
      <circle cx="57" cy="28" r="1.5" fill="#DFBA73" />
    </svg>
  )
}
