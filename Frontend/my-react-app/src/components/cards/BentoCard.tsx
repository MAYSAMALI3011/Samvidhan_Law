import { useState, useRef, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, type LucideIcon } from 'lucide-react'

interface BentoCardProps {
  to: string
  title: string
  badge: string
  description: string
  actionLabel: string
  icon: LucideIcon
  className?: string
  featured?: boolean
}

export function BentoCard({
  to,
  title,
  badge,
  description,
  actionLabel,
  icon: Icon,
  className = '',
  featured = false,
}: BentoCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)

  const handleMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleMouseLeave = () => {
    setMousePos(null)
  }

  return (
    <Link
      ref={cardRef}
      to={to}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`bento-card ${featured ? 'bento-card-featured' : ''} ${className}`}
      aria-label={`${title} — ${badge}`}
    >
      {/* Dynamic Cursor-Following Radial Glow */}
      {mousePos && (
        <div
          className="bento-cursor-glow"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
          }}
          aria-hidden="true"
        />
      )}

      <div className="bento-card-content">
        <div className="bento-card-topbar">
          <div className="bento-icon-box">
            <Icon size={22} className="bento-icon" aria-hidden="true" />
          </div>
          <span className="bento-badge">{badge}</span>
        </div>

        <h3 className="bento-title">{title}</h3>
        <p className="bento-description">{description}</p>

        <div className="bento-action-row">
          <span className="bento-action-label">{actionLabel}</span>
          <ArrowRight size={15} className="bento-action-arrow" aria-hidden="true" />
        </div>
      </div>
    </Link>
  )
}
