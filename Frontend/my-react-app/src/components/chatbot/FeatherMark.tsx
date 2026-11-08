import React from 'react'

export interface FeatherMarkProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number
  state?: 'normal' | 'drawing' | 'thinking' | 'error'
  mode?: 'dark' | 'light' | 'mono-cream' | 'mono-navy'
  className?: string
  showEyeShimmer?: boolean
}

export function FeatherMark({
  size = 64,
  state = 'normal',
  mode = 'dark',
  className = '',
  showEyeShimmer = true,
  ...rest
}: FeatherMarkProps) {
  // Uses the exact artwork from Concept P05 sheet (Panel 01 crop) at native crisp pixel density
  return (
    <div
      className={`feather-mark-root mode-${mode} state-${state} ${className}`}
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
      role="img"
      aria-label="Samvidhan Fluid Dual Plume Emblem"
      {...rest}
    >
      <img
        src="/assets/brand/plume-emblem-hd.png"
        srcSet="/assets/brand/plume-emblem-1x.png 60w, /assets/brand/plume-emblem-2x.png 120w, /assets/brand/plume-emblem-3x.png 180w, /assets/brand/plume-emblem-hd.png 256w, /assets/brand/plume-emblem-full.png 512w"
        sizes={`${size}px`}
        width={size}
        height={size}
        alt="Fluid Dual Plume"
        className={`feather-emblem-img ${state === 'error' ? 'feather-droop-error' : ''}`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          filter: state === 'thinking' ? 'drop-shadow(0 0 10px rgba(232, 155, 69, 0.7))' : undefined,
        }}
      />
      {showEyeShimmer && (
        <span
          className="plume-eye-glow-dot"
          style={{
            position: 'absolute',
            width: Math.max(4, Math.round(size * 0.08)),
            height: Math.max(4, Math.round(size * 0.08)),
            borderRadius: '50%',
            background: '#E89B45',
            top: '49%',
            left: '48%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            boxShadow: '0 0 8px #E89B45, 0 0 2px #FFFFFF',
            opacity: 0.85,
          }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}
