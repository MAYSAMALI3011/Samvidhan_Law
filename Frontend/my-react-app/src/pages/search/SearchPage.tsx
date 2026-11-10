import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BookOpen, FileText, Landmark, Library, Sparkles } from 'lucide-react'
import { searchAll } from '../../services/catalog'
import type { ConstitutionTopic, Course, Lesson, LibraryDocument } from '../../types'
import { usePageMeta } from '../../hooks/usePageMeta'
import { Skeleton } from '../../components/feedback/Toasts'
import { BackButton } from '../../components/common/BackButton'
import { EmptyStateView } from '../../ui/feedback/EmptyStateView'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { GhostComplete } from '../../components/ui/TextFields.jsx'

const RECENT_SEARCHES_KEY = 'samvidhan_recent_searches'
const popularSearches = ['Preamble', 'Fundamental Rights', 'DPDP Act 2023', 'Consumer Protection', 'Article 21', 'Cyber Fraud', 'Arrest Safeguards']

function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY)
    return raw ? JSON.parse(raw) : popularSearches
  } catch {
    return popularSearches
  }
}

function saveRecentSearch(term: string) {
  if (!term.trim()) return
  try {
    const current = getRecentSearches()
    const filtered = [term.trim(), ...current.filter((s) => s.toLowerCase() !== term.trim().toLowerCase())].slice(0, 10)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(filtered))
  } catch {
    /* ignore storage error */
  }
}

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const initial = params.get('q') ?? ''
  const [q, setQ] = useState(initial)
  const { debouncedValue } = useDebouncedValue(q, 400)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{
    courses: Course[]
    lessons: Lesson[]
    topics: ConstitutionTopic[]
    documents: LibraryDocument[]
  } | null>(null)

  const [recentSearches, setRecentSearches] = useState<string[]>(getRecentSearches)

  const getSearchSuggestion = (text: string): string => {
    if (!text.trim() || text.length < 2) return ''
    const searchPool = [...recentSearches, ...popularSearches]
    const match = searchPool.find(
      (item) => item.toLowerCase().startsWith(text.toLowerCase()) && item.toLowerCase() !== text.toLowerCase()
    )
    return match || ''
  }

  usePageMeta({
    title: 'Search Legal Catalogue',
    description: 'Search sample Samvidhan lessons, constitution topics, and legal library guides.',
    path: '/search',
  })

  async function run(term: string) {
    if (!term.trim()) {
      setResults(null)
      return
    }
    saveRecentSearch(term)
    setRecentSearches(getRecentSearches())
    setLoading(true)
    const data = await searchAll(term)
    setResults(data)
    setLoading(false)
  }

  useEffect(() => {
    if (!initial) return
    const timer = window.setTimeout(() => void run(initial), 0)
    return () => window.clearTimeout(timer)
  }, [initial])

  useEffect(() => {
    if (debouncedValue.trim() && debouncedValue !== initial) {
      setParams({ q: debouncedValue }, { replace: true })
      const timer = window.setTimeout(() => void run(debouncedValue), 0)
      return () => window.clearTimeout(timer)
    }
  }, [debouncedValue, initial, setParams])

  const totalResults = results
    ? results.courses.length + results.lessons.length + results.topics.length + results.documents.length
    : 0

  const empty = results && totalResults === 0

  return (
    <div className="container page-hero" style={{ maxWidth: '56rem' }}>
      <BackButton label="Back" />
      <div style={{ marginBottom: '2rem' }}>
        <p className="kicker">Catalogue Finder</p>
        <h1>Search Samvidhan</h1>
        <p className="muted" style={{ fontSize: '1.05rem', margin: 0 }}>
          Search curriculum courses, structured lessons, constitutional articles, and sample library guides.
        </p>
      </div>

      {/* Search Input Bar with GhostComplete */}
      <form
        className="search-bar"
        role="search"
        style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}
        onSubmit={(e) => {
          e.preventDefault()
          setParams(q ? { q } : {})
          void run(q)
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <GhostComplete
            label=""
            id="q"
            type="search"
            value={q}
            onChange={(val) => setQ(val)}
            placeholder="Search by keyword, article, or legal scenario..."
            getSuggestion={getSearchSuggestion}
          />
        </div>
        <button
          className="btn gold"
          type="submit"
          style={{ minHeight: '46px', paddingInline: '1.5rem', flexShrink: 0 }}
        >
          <span>Search</span>
        </button>
      </form>

      {/* Popular Suggested Searches */}
      <div style={{ margin: '1rem 0 2rem' }}>
        <p className="eyebrow" style={{ fontSize: '0.72rem', marginBottom: '0.4rem' }}>
          Suggested Topics
        </p>
        <div className="chips">
          {popularSearches.map((term) => (
            <button
              key={term}
              type="button"
              className="chip"
              onClick={() => {
                setQ(term)
                setParams({ q: term })
                void run(term)
              }}
            >
              <Sparkles size={12} className="chip-icon" style={{ marginRight: '0.3rem' }} aria-hidden="true" />
              <span>{term}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? <Skeleton label="Scanning curriculum and statutory resources" /> : null}

      {empty ? (
        <EmptyStateView
          title={`No results found for "${q}"`}
          description="We could not find any matches in the current constitutional syllabus. Try one of our popular reference guides below."
          mascotMood="thinking"
          suggestions={[
            { label: 'Fundamental Rights (Part III)', to: '/constitution' },
            { label: 'Preamble Doctrine', to: '/learn' },
            { label: 'Police & Arrest Rules', to: '/library' },
            { label: 'Consumer Protection', to: '/library' },
          ]}
        />
      ) : null}

      {results && !empty ? (
        <div style={{ display: 'grid', gap: '2rem' }}>
          <p className="meta" style={{ fontWeight: 600 }}>
            Found {totalResults} result{totalResults === 1 ? '' : 's'} matching "{q}"
          </p>

          {/* Courses */}
          {results.courses.length > 0 ? (
            <section>
              <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <BookOpen size={18} style={{ color: 'var(--gold)' }} aria-hidden="true" />
                Courses ({results.courses.length})
              </h2>
              <div className="grid-2">
                {results.courses.map((c) => (
                  <article className="card" key={c.id}>
                    <span className="eyebrow">{c.level}</span>
                    <h3 style={{ fontSize: '1.15rem', marginTop: '0.35rem' }}>
                      <Link to={`/learn/${c.id}`}>{c.title}</Link>
                    </h3>
                    <p className="muted" style={{ fontSize: '0.9rem', margin: '0 0 0.75rem' }}>
                      {c.tagline}
                    </p>
                    <Link to={`/learn/${c.id}`} style={{ fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 600 }}>
                      View syllabus ?
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {/* Lessons */}
          {results.lessons.length > 0 ? (
            <section>
              <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <FileText size={18} style={{ color: 'var(--gold)' }} aria-hidden="true" />
                Lessons ({results.lessons.length})
              </h2>
              <div className="grid-2">
                {results.lessons.map((l) => (
                  <article className="card" key={l.id}>
                    <span className="eyebrow">{l.durationMinutes} min read</span>
                    <h3 style={{ fontSize: '1.15rem', marginTop: '0.35rem' }}>
                      <Link to={`/learn/${l.courseId}/${l.id}`}>{l.title}</Link>
                    </h3>
                    <p className="muted" style={{ fontSize: '0.9rem', margin: '0 0 0.75rem' }}>
                      {l.summary}
                    </p>
                    <Link to={`/learn/${l.courseId}/${l.id}`} style={{ fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 600 }}>
                      Read lesson ?
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {/* Constitution Topics */}
          {results.topics.length > 0 ? (
            <section>
              <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Landmark size={18} style={{ color: 'var(--gold)' }} aria-hidden="true" />
                Constitution Topics ({results.topics.length})
              </h2>
              <div className="grid-2">
                {results.topics.map((t) => (
                  <article className="card" key={t.id}>
                    <span className="eyebrow">{t.part}</span>
                    <h3 style={{ fontSize: '1.15rem', marginTop: '0.35rem' }}>
                      <Link to={`/constitution/${t.id}`}>{t.title}</Link>
                    </h3>
                    <p className="muted" style={{ fontSize: '0.9rem', margin: '0 0 0.75rem' }}>
                      {t.summary}
                    </p>
                    <Link to={`/constitution/${t.id}`} style={{ fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 600 }}>
                      Read constitutional note ?
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {/* Library Documents */}
          {results.documents.length > 0 ? (
            <section>
              <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Library size={18} style={{ color: 'var(--gold)' }} aria-hidden="true" />
                Legal Library Guides ({results.documents.length})
              </h2>
              <div className="grid-2">
                {results.documents.map((d) => (
                  <article className="card" key={d.id}>
                    <span className="eyebrow">{d.category}</span>
                    <h3 style={{ fontSize: '1.15rem', marginTop: '0.35rem' }}>
                      <Link to={`/library/${d.id}`}>{d.title}</Link>
                    </h3>
                    <p className="muted" style={{ fontSize: '0.9rem', margin: '0 0 0.75rem' }}>
                      {d.summary}
                    </p>
                    <Link to={`/library/${d.id}`} style={{ fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 600 }}>
                      Read practical guide ?
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}


