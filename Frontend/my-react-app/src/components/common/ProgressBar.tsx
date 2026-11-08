import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const safe = Math.max(0, Math.min(100, value))
  return (
    <div>
      {label ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
          <span className="meta" style={{ fontSize: '0.82rem', fontWeight: 600 }}>{label}</span>
          <span className="meta" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--gold)' }}>{safe}%</span>
        </div>
      ) : null}
      <div className="progress" role="progressbar" aria-valuenow={safe} aria-valuemin={0} aria-valuemax={100}>
        <span style={{ width: `${safe}%` }} />
      </div>
    </div>
  )
}

export function Breadcrumbs({ items }: { items: { to?: string; label: string }[] }) {
  return (
    <nav
      aria-label="Breadcrumb Navigation"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem',
        flexWrap: 'wrap',
        marginBottom: '1.25rem',
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
      }}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <span key={item.label} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            {i > 0 ? <ChevronRight size={13} style={{ color: 'var(--text-tertiary)' }} aria-hidden="true" /> : null}
            {item.to && !isLast ? (
              <Link
                to={item.to}
                style={{
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  transition: 'color var(--transition-fast)',
                }}
                className="breadcrumb-link"
              >
                {item.label}
              </Link>
            ) : (
              <span style={{ color: isLast ? 'var(--text)' : 'inherit', fontWeight: isLast ? 600 : 'normal' }}>
                {item.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
