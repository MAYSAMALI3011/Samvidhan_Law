interface SkeletonProps {
  label?: string
  height?: string | number
  width?: string | number
  className?: string
}

export function Skeleton({ label, height, width, className = '' }: SkeletonProps) {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        height: height ?? '1.2rem',
        width: width ?? '100%',
      }}
      aria-busy="true"
      aria-label={label ?? 'Loading content'}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="card skeleton-card-wrap" aria-busy="true" aria-label="Loading card">
      <div className="skeleton-shimmer" style={{ height: '18px', width: '35%', marginBottom: '1rem', borderRadius: '4px' }} />
      <div className="skeleton-shimmer" style={{ height: '26px', width: '80%', marginBottom: '0.75rem', borderRadius: '4px' }} />
      <div className="skeleton-shimmer" style={{ height: '14px', width: '95%', marginBottom: '0.5rem', borderRadius: '4px' }} />
      <div className="skeleton-shimmer" style={{ height: '14px', width: '70%', marginBottom: '1.5rem', borderRadius: '4px' }} />
      <div className="skeleton-shimmer" style={{ height: '36px', width: '100%', borderRadius: '8px' }} />
    </div>
  )
}

export function StatSkeleton() {
  return (
    <div className="dashboard-stat-card" aria-busy="true" aria-label="Loading metric">
      <div className="skeleton-shimmer" style={{ width: '42px', height: '42px', borderRadius: '8px', marginBottom: '1rem' }} />
      <div className="skeleton-shimmer" style={{ width: '60px', height: '32px', marginBottom: '0.5rem', borderRadius: '4px' }} />
      <div className="skeleton-shimmer" style={{ width: '90px', height: '14px', borderRadius: '4px' }} />
    </div>
  )
}
