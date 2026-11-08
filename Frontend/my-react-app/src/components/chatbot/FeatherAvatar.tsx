import React from 'react'

export interface FeatherAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number
  mode?: 'dark' | 'light' | 'mono-cream' | 'mono-navy'
  className?: string
  animated?: boolean
}

export function FeatherAvatar({
  size = 32,
  mode = 'dark',
  className = '',
  animated = false,
  ...rest
}: FeatherAvatarProps) {
  return (
    <div
      className={`feather-avatar-container ${animated ? 'chat-launcher-plume-sway' : ''} ${className}`}
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
      }}
      aria-hidden="true"
      data-mode={mode}
      {...rest}
    >
      <img
        src="/assets/brand/plume-emblem-1x.png"
        srcSet="/assets/brand/plume-emblem-1x.png 60w, /assets/brand/plume-emblem-2x.png 120w, /assets/brand/plume-emblem-3x.png 180w"
        sizes={`${size}px`}
        width={size}
        height={size}
        alt="Plume emblem avatar"
        className="feather-avatar-img"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    </div>
  )
}
