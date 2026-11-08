import './skeleton.css'

export function DashboardPathSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="path-skeleton-track" aria-busy="true" aria-label="Loading curriculum path">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="path-skeleton-node-wrap">
          <div className="saas-skeleton-shimmer path-skeleton-circle" />
          <div className="saas-skeleton-shimmer path-skeleton-caption" />
          <div className="saas-skeleton-shimmer path-skeleton-sub" />
        </div>
      ))}
    </div>
  )
}

export function ArticleOfTheDaySkeleton() {
  return (
    <div className="aotd-skeleton-card" aria-busy="true" aria-label="Loading Article of the Day">
      <div className="aotd-skeleton-top">
        <div className="saas-skeleton-shimmer" style={{ width: '120px', height: '22px' }} />
        <div className="saas-skeleton-shimmer" style={{ width: '60px', height: '16px' }} />
      </div>
      <div className="aotd-skeleton-body">
        <div>
          <div className="saas-skeleton-shimmer" style={{ width: '85%', height: '20px', marginBottom: '8px' }} />
          <div className="saas-skeleton-shimmer" style={{ width: '100%', height: '14px', marginBottom: '6px' }} />
          <div className="saas-skeleton-shimmer" style={{ width: '70%', height: '14px', marginBottom: '8px' }} />
          <div className="saas-skeleton-shimmer" style={{ width: '45%', height: '12px' }} />
        </div>
        <div className="saas-skeleton-shimmer" style={{ width: '56px', height: '56px', borderRadius: '50%' }} />
      </div>
      <div className="saas-skeleton-shimmer" style={{ width: '150px', height: '36px', borderRadius: '999px' }} />
    </div>
  )
}

export function StreakCardSkeleton() {
  return (
    <div className="streak-skeleton-card" aria-busy="true" aria-label="Loading streak information">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="saas-skeleton-shimmer" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
          <div>
            <div className="saas-skeleton-shimmer" style={{ width: '100px', height: '18px', marginBottom: '4px' }} />
            <div className="saas-skeleton-shimmer" style={{ width: '140px', height: '12px' }} />
          </div>
        </div>
        <div className="saas-skeleton-shimmer" style={{ width: '110px', height: '28px', borderRadius: '999px' }} />
      </div>

      <div className="streak-skeleton-grid">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="streak-skeleton-day">
            <div className="saas-skeleton-shimmer" style={{ width: '14px', height: '12px' }} />
            <div className="saas-skeleton-shimmer streak-skeleton-dot" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function CurriculumCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid-3" aria-busy="true" aria-label="Loading courses">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <div className="saas-skeleton-shimmer" style={{ width: '70px', height: '20px', borderRadius: '999px', marginBottom: '1rem' }} />
          <div className="saas-skeleton-shimmer" style={{ width: '90%', height: '22px', marginBottom: '0.75rem' }} />
          <div className="saas-skeleton-shimmer" style={{ width: '100%', height: '14px', marginBottom: '0.4rem' }} />
          <div className="saas-skeleton-shimmer" style={{ width: '75%', height: '14px', marginBottom: '1.5rem' }} />
          <div className="saas-skeleton-shimmer" style={{ width: '100%', height: '8px', borderRadius: '4px', marginBottom: '1rem' }} />
          <div className="saas-skeleton-shimmer" style={{ width: '120px', height: '36px', borderRadius: '999px' }} />
        </div>
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="table-skeleton-wrap" aria-busy="true" aria-label="Loading data records">
      <div className="table-skeleton-header">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="saas-skeleton-shimmer" style={{ flex: i === 0 ? 2 : 1, height: '18px' }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="table-skeleton-row">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="saas-skeleton-shimmer" style={{ flex: c === 0 ? 2 : 1, height: '16px' }} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function AiTypingShimmer() {
  return (
    <div className="ai-typing-shimmer-box" aria-busy="true" aria-label="AI is researching legal sources">
      <div className="saas-skeleton-shimmer ai-avatar-shimmer" />
      <div className="ai-lines-shimmer">
        <div className="saas-skeleton-shimmer" style={{ width: '90%', height: '16px' }} />
        <div className="saas-skeleton-shimmer" style={{ width: '100%', height: '14px' }} />
        <div className="saas-skeleton-shimmer" style={{ width: '80%', height: '14px' }} />
        <div className="saas-skeleton-shimmer" style={{ width: '50%', height: '12px', marginTop: '4px' }} />
      </div>
    </div>
  )
}
