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

  if (variant === 'icon') {
    return (
      <img
        className={className}
        src={assetUrl('/assets/brand/samvidhan-icon.svg')}
        width={height || 36}
        height={height || 36}
        alt="Samvidhan"
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
      />
    )
  }

  const src =
    onDark || theme === 'dark'
      ? assetUrl('/assets/brand/samvidhan-primary-dark.svg')
      : assetUrl('/assets/brand/samvidhan-primary-light.svg')

  return (
    <img
      className={className}
      src={src}
      width={typeof height === 'number' ? Math.round(Number(height) * 3.6) : 220}
      height={height || 60}
      alt="Samvidhan – Indian law, made simple"
    />
  )
}
