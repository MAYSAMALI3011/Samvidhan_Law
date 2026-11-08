import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Variant = 'primary' | 'secondary' | 'gold' | 'ghost'

interface Base {
  children: ReactNode
  variant?: Variant
  className?: string
  style?: CSSProperties
  onClick?: () => void
}

export function Button({
  children,
  variant = 'primary',
  className = '',
  style,
  onClick,
  ...rest
}: Base & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`btn ${variant} ${className}`} style={style} onClick={onClick} {...rest}>
      {children}
    </button>
  )
}

export function ButtonLink({
  to,
  children,
  variant = 'primary',
  className = '',
  style,
  onClick,
}: Base & { to: string }) {
  return (
    <Link className={`btn ${variant} ${className}`} style={style} to={to} onClick={onClick}>
      {children}
    </Link>
  )
}
