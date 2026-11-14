import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, BookOpen, ArrowRight, Compass } from 'lucide-react'

export function ConstitutionTeaser() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    navigate(`/search?q=${encodeURIComponent(query.trim())}&filter=constitution`)
  }

  const landmarkPills = [
    { label: 'The Preamble', path: '/learn/foundations-of-the-republic/preamble-we-the-people' },
    { label: 'Article 14: Equality Before Law', path: '/constitution' },
    { label: 'Article 19: Six Basic Freedoms', path: '/constitution' },
    { label: 'Article 21: Protection of Life & Liberty', path: '/constitution' },
    { label: 'Article 32: Constitutional Remedies', path: '/constitution' },
  ]

  return (
    <section className="constitution-teaser-section container" aria-labelledby="constitution-teaser-title" style={{ margin: '3.5rem auto' }}>
      <div className="constitution-teaser-box">
        <div style={{ maxWidth: '42rem' }}>
          <span className="section-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Compass size={13} className="text-gold" aria-hidden="true" />
            Direct Primary Source Access
          </span>
          <h2 id="constitution-teaser-title" className="section-title" style={{ margin: '0.35rem 0 0.5rem' }}>
            Explore the Constitution of India
          </h2>
          <p className="section-desc" style={{ margin: 0 }}>
            Read the founding charter with annotated explanations, legislative history, and Supreme Court landmark citations.
          </p>

          {/* Quick Search Box */}
          <form onSubmit={handleSearch} className="constitution-quick-search-form">
            <div className="constitution-quick-input-wrap">
              <Search size={16} className="text-gold" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search articles, clauses, fundamental duties..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search the Constitution"
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0 1.25rem' }}>
              <span>Search</span>
            </button>
          </form>

          {/* Landmark Quick Pills */}
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.65rem' }}>
              Landmark Provisions
            </span>
            <div className="constitution-pills-row">
              {landmarkPills.map((pill) => (
                <Link key={pill.label} to={pill.path} className="constitution-article-pill">
                  <BookOpen size={13} className="text-gold" aria-hidden="true" />
                  <span>{pill.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(176, 141, 87, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <span style={{ fontSize: '0.84rem', color: '#94a3b8' }}>
            All 395 Articles &amp; 12 Schedules organized by Part and Subject
          </span>
          <Link to="/constitution" className="btn btn-outline btn-sm">
            <span>Browse Full Constitution Reader</span>
            <ArrowRight size={13} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
