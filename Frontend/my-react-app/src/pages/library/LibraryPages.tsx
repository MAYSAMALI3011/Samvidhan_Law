import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowRight, BookOpen, Copy, Search, ShieldCheck, LayoutGrid, Table } from 'lucide-react'
import { libraryCategories, libraryDocuments } from '../../data/mock/library'
import { getLibraryDocument } from '../../services/catalog'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { EmptyStateView } from '../../ui/feedback/EmptyStateView'
import { TableSkeleton } from '../../ui/skeletons'
import { DataTable, type Column } from '../../ui/data/DataTable'
import { AdvancedFilterBar, type FilterConfig } from '../../ui/data/AdvancedFilterBar'
import { Breadcrumbs } from '../../components/common/ProgressBar'
import { BackButton } from '../../components/common/BackButton'
import { Button } from '../../components/common/Button'
import { useAppState } from '../../context/useAppState'
import { TagInput } from '../../components/ui/TextFields.jsx'
import type { LibraryDocument } from '../../types'

const filterConfigs: FilterConfig[] = [
  {
    key: 'category',
    label: 'Category',
    options: libraryCategories.filter((c) => c !== 'All').map((c) => ({ value: c, label: c })),
  },
]

const tableColumns: Column<LibraryDocument>[] = [
  {
    key: 'title',
    header: 'Title & Summary',
    sortable: true,
    render: (doc) => (
      <div>
        <Link to={`/library/${doc.id}`} style={{ fontWeight: 600, color: 'var(--text)' }}>
          {doc.title}
        </Link>
        <p className="muted" style={{ fontSize: '0.8rem', margin: '2px 0 0' }}>
          {doc.summary.slice(0, 95)}...
        </p>
      </div>
    ),
  },
  {
    key: 'category',
    header: 'Category',
    sortable: true,
    render: (doc) => <span className="badge" style={{ fontSize: '0.75rem' }}>{doc.category}</span>,
  },
  {
    key: 'sourceLabel',
    header: 'Statutory Source',
    sortable: true,
  },
  {
    key: 'updatedLabel',
    header: 'Last Revised',
    sortable: true,
  },
]

export function LibraryIndexPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const { debouncedValue, isDebouncing } = useDebouncedValue(query, 300)

  const activeTags = useMemo(() => {
    const raw = searchParams.get('tags')
    return raw ? raw.split(',').filter(Boolean) : []
  }, [searchParams])

  const handleTagsChange = (newTags: string[]) => {
    const nextParams = new URLSearchParams(searchParams)
    if (newTags.length) {
      nextParams.set('tags', newTags.join(','))
    } else {
      nextParams.delete('tags')
    }
    setSearchParams(nextParams, { replace: true })
  }

  usePageMeta({
    title: 'Legal Library & Guides',
    description: 'Sample educational documents, checklists, and statutory study guides.',
    path: '/library',
  })

  const category = activeFilters['category'] || 'All'

  const docs = useMemo(() => {
    return libraryDocuments.filter((d) => {
      const cat = category === 'All' || d.category === category
      const q = debouncedValue.trim().toLowerCase()
      const text = !q || `${d.title} ${d.summary} ${d.tags.join(' ')}`.toLowerCase().includes(q)
      const matchesTags =
        activeTags.length === 0 ||
        activeTags.every((t) =>
          d.tags.some((dt) => dt.toLowerCase().includes(t.toLowerCase()))
        )
      return cat && text && matchesTags
    })
  }, [debouncedValue, category, activeTags])

  return (
    <div className="container page-hero">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <Link to="/dashboard" className="btn btn-outline btn-sm back-to-dashboard-btn">
          <ArrowRight size={15} style={{ transform: 'rotate(180deg)' }} aria-hidden="true" />
          <span>Back to Dashboard</span>
        </Link>
        <span className="section-eyebrow" style={{ margin: 0 }}>
          <BookOpen size={14} className="text-gold" aria-hidden="true" />
          Reference Archive
        </span>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <p className="kicker">Reference Resources</p>
        <h1>Legal Library & Guides</h1>
        <p className="muted" style={{ maxWidth: '44rem', fontSize: '1.1rem' }}>
          Educational checklists, study methods, and practical frameworks. These sample guides are designed to build legal reading habits — not to serve as gazetted legislation.
        </p>
      </div>

      {/* Pattern 12: Advanced Data Filtering Bar */}
      <AdvancedFilterBar
        configs={filterConfigs}
        activeFilters={activeFilters}
        onFilterChange={setActiveFilters}
        totalCount={libraryDocuments.length}
        filteredCount={docs.length}
      />

      {/* Search Input Bar & View Mode Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', margin: '1rem 0' }}>
        <form
          className="lib-search-bar"
          onSubmit={(e) => e.preventDefault()}
          role="search"
          style={{ flex: 1, margin: 0 }}
        >
          <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
            <Search
              size={18}
              className="text-gold"
              style={{ position: 'absolute', left: '1.25rem', pointerEvents: 'none' }}
              aria-hidden="true"
            />
            <input
              id="lib-q"
              className="lib-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search guides by title, keyword, or topic (e.g. consumer, cyber, constitution)"
              aria-label="Filter library documents"
            />
          </div>
          {query ? (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setQuery('')}
              style={{ marginRight: '0.5rem' }}
            >
              Clear
            </button>
          ) : null}
        </form>

        {/* View Switcher: Grid vs Table */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '10px' }}>
          <button
            type="button"
            className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('grid')}
            title="Grid card view"
            aria-label="Grid card view"
          >
            <LayoutGrid size={15} />
          </button>
          <button
            type="button"
            className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('table')}
            title="Data table view"
            aria-label="Data table view"
          >
            <Table size={15} />
          </button>
        </div>
      </div>

      {/* Tag Filter Chips (Synced with URL) */}
      <div style={{ marginBottom: '1.25rem' }}>
        <TagInput
          label="Filter by Topic Tags"
          tags={activeTags}
          onChange={handleTagsChange}
          suggestions={['constitution', 'method', 'consumer', 'checklist', 'rti', 'transparency', 'police', 'arrest', 'cyber']}
          max={6}
        />
      </div>

      {isDebouncing ? (
        <TableSkeleton rows={4} cols={3} />
      ) : docs.length === 0 ? (
        <EmptyStateView
          title="No matching legal guides"
          description={`We could not find any sample guides matching "${query}". Try clearing the search or choosing another statutory category.`}
          mascotMood="thinking"
          action={{
            label: 'Clear filters',
            onClick: () => {
              setQuery('')
              setActiveFilters({})
            },
          }}
          suggestions={[
            { label: 'Consumer Rights', to: '/library/sample-consumer-checklist' },
            { label: 'RTI Application Guide', to: '/library/sample-rti-application' },
            { label: 'Arrest Safeguards', to: '/library/fir-checklist' },
          ]}
        />
      ) : viewMode === 'table' ? (
        <DataTable
          data={docs}
          columns={tableColumns}
          keyExtractor={(item) => item.id}
          pageSize={6}
        />
      ) : (
        <div className="grid-2">
          {docs.map((doc) => (
            <article className="card" key={doc.id} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--gold)',
                    background: 'var(--gold-light)',
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  {doc.category}
                </span>
                <span className="meta" style={{ fontSize: '0.8rem' }}>{doc.updatedLabel}</span>
              </div>

              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem', lineHeight: '1.35' }}>
                <Link to={`/library/${doc.id}`} style={{ color: 'inherit' }}>
                  {doc.title}
                </Link>
              </h3>

              <p className="muted" style={{ fontSize: '0.92rem', margin: '0 0 1rem', flex: 1 }}>
                {doc.summary}
              </p>

              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {doc.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: '0.72rem',
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--surface-2)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    #{t}
                  </span>
                ))}
              </div>

              <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', marginTop: 'auto' }}>
                <Link
                  to={`/library/${doc.id}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: 'var(--gold)',
                  }}
                >
                  <span>Read full guide</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export function LibraryDocumentPage() {
  const { documentId = '' } = useParams()
  const doc = getLibraryDocument(documentId)
  const { pushToast } = useAppState()

  usePageMeta({
    title: doc?.title ?? 'Document',
    description: doc?.summary ?? 'Library document',
    path: `/library/${documentId}`,
  })

  if (!doc) {
    return (
      <EmptyStateView
        title="Document not found"
        description="That sample document is not in the library archives."
        action={{ label: 'Back to Library', to: '/library' }}
      />
    )
  }

  return (
    <article className="container reading-layout page-hero">
      <BackButton to="/library" label="Back to Legal Library" />
      <Breadcrumbs items={[{ to: '/library', label: 'Legal Library' }, { label: doc.title }]} />

      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--gold)',
              background: 'var(--gold-light)',
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {doc.category}
          </span>
          <span className="meta">{doc.updatedLabel}</span>
        </div>

        <h1 style={{ fontSize: 'clamp(2rem, 3.6vw, 2.85rem)' }}>{doc.title}</h1>
        <p className="muted" style={{ fontSize: '1.15rem', lineHeight: '1.6', margin: 0 }}>
          {doc.summary}
        </p>

        <div className="banner info" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <ShieldCheck size={20} style={{ flexShrink: 0 }} aria-hidden="true" />
          <span>Educational Reference: {doc.sourceLabel}. Demonstration text for civic literacy; verify against official Gazette publications for legal proceedings.</span>
        </div>
      </header>

      <div className="reading">
        {doc.body.map((p, idx) => (
          <p key={idx}>{p}</p>
        ))}
      </div>

      <div className="action-row" style={{ marginTop: '2.5rem' }}>
        <Button
          type="button"
          variant="secondary"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(`${doc.title} — ${doc.sourceLabel}`)
              pushToast('Sample citation copied to clipboard.', 'success')
            } catch {
              pushToast('Could not copy citation.', 'error')
            }
          }}
        >
          <Copy size={16} aria-hidden="true" />
          <span>Copy Citation Reference</span>
        </Button>

        <Link
          to="/library"
          className="btn ghost"
          style={{ marginLeft: 'auto' }}
        >
          <span>Return to library</span>
        </Link>
      </div>
    </article>
  )
}


