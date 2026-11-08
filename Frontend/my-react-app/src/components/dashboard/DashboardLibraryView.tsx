import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Search, ShieldCheck } from 'lucide-react'
import { libraryCategories, libraryDocuments } from '../../data/mock/library'

export function DashboardLibraryView() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')

  const docs = useMemo(() => {
    return libraryDocuments.filter((d) => {
      const cat = category === 'All' || d.category === category
      const q = query.trim().toLowerCase()
      const text = !q || `${d.title} ${d.summary} ${d.tags.join(' ')}`.toLowerCase().includes(q)
      return cat && text
    })
  }, [query, category])

  return (
    <div className="dashboard-embedded-view" role="region" aria-label="Legal Library & Practical Guides">
      <div className="dashboard-view-header">
        <span className="section-eyebrow">
          <BookOpen size={14} className="text-gold" aria-hidden="true" />
          Reference Resources
        </span>
        <h2 className="dashboard-view-title">Legal Library &amp; Practical Guides</h2>
        <p className="dashboard-view-desc">
          Educational checklists, study methods, and practical frameworks to build legal confidence without dry legalese.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="search-bar">
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
          <Search
            size={18}
            style={{ position: 'absolute', left: '1rem', color: '#dfba73' }}
            aria-hidden="true"
          />
          <input
            id="dash-lib-q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guides by title, keyword, or topic (e.g. consumer, cyber, RTI, FIR)"
            style={{ paddingLeft: '2.75rem' }}
            aria-label="Filter library documents"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="filters" role="group" aria-label="Library Categories">
        {libraryCategories.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        Showing {docs.length} educational guides
      </div>

      {/* Documents Grid */}
      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {docs.map((doc) => (
          <article
            key={doc.id}
            className="samvidhan-glow-card dashboard-guide-card"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="eyebrow text-gold" style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>
                  {doc.category}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {doc.updatedLabel || 'Reference Guide'}
                </span>
              </div>

              <h4 style={{ fontFamily: 'var(--font-heading, Georgia, serif)', fontSize: '1.18rem', color: 'var(--text)', margin: '0.4rem 0' }}>
                {doc.title}
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.5', margin: 0 }}>
                {doc.summary}
              </p>

              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.85rem' }}>
                {doc.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: '0.7rem',
                      background: 'rgba(176, 141, 87, 0.12)',
                      color: 'var(--gold)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ShieldCheck size={14} className="text-gold" />
                Verified Framework
              </span>
              <Link
                to={`/library/${doc.id}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--gold)', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}
              >
                <span>Read Guide</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
