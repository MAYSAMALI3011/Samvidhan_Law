import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, BookOpen, Landmark, FileText, ArrowRight, Loader2 } from 'lucide-react'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'

interface SearchItem {
  id: string
  title: string
  category: 'Lesson' | 'Constitution' | 'Library'
  to: string
  snippet: string
}

const searchableCatalog: SearchItem[] = [
  {
    id: 'preamble',
    title: 'We, The People: The Source of Power',
    category: 'Lesson',
    to: '/learn/the-preamble-and-sovereignty/preamble-we-the-people',
    snippet: 'Preamble bedrock, sovereign democratic republic',
  },
  {
    id: 'basic-structure',
    title: 'Basic Structure: Kesavananda Bharati',
    category: 'Lesson',
    to: '/learn/the-preamble-and-sovereignty/basic-structure-doctrine',
    snippet: 'Article 368 limitations and democracy preservation',
  },
  {
    id: 'art-21',
    title: 'Article 21: Right to Life & Personal Liberty',
    category: 'Constitution',
    to: '/constitution/part-iii',
    snippet: 'Due process, Maneka Gandhi fair procedure doctrine',
  },
  {
    id: 'art-19',
    title: 'Article 19: Six Democratic Freedoms',
    category: 'Constitution',
    to: '/constitution/part-iii',
    snippet: 'Speech, peaceful assembly, movement across India',
  },
  {
    id: 'fir-guide',
    title: 'Filing a First Information Report (FIR)',
    category: 'Library',
    to: '/library/fir-checklist',
    snippet: 'Section 154 CrPC, Zero FIR, citizen safeguards upon arrest',
  },
  {
    id: 'rti-draft',
    title: 'How to File an RTI Application',
    category: 'Library',
    to: '/library/sample-rti-application',
    snippet: 'Section 6(1) query drafting, 30-day statutory window',
  },
  {
    id: 'consumer-protection',
    title: 'Consumer Dispute & Defective Product Notice',
    category: 'Library',
    to: '/library/sample-consumer-checklist',
    snippet: 'District consumer commission procedure and compensation',
  },
  {
    id: 'dpdp-compliance',
    title: 'DPDP Act 2023 & E-Commerce Compliance Guide',
    category: 'Library',
    to: '/library/dpdp-business-compliance-checklist',
    snippet: '8 Essential Rules: 1-Tap Consent, Grievance Officer, Erasure, Seller Disclosures',
  },
]

export function NavbarInlineSearch() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [query, setQuery] = useState('')
  const { debouncedValue, isDebouncing } = useDebouncedValue(query, 300)
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter items based on debounced query (cancelling stale calls)
  const results = debouncedValue.trim().length > 0
    ? searchableCatalog.filter((item) => {
        const q = debouncedValue.toLowerCase()
        return (
          item.title.toLowerCase().includes(q) ||
          item.snippet.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        )
      })
    : []

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsExpanded(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Global Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsExpanded(true)
        setTimeout(() => inputRef.current?.focus(), 50)
      } else if (e.key === 'Escape') {
        setIsExpanded(false)
        inputRef.current?.blur()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Auto-focus input upon expansion
  useEffect(() => {
    if (isExpanded) {
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [isExpanded])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setIsExpanded(false)
    navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  const handleSelectResult = (to: string) => {
    setIsExpanded(false)
    setQuery('')
    navigate(to)
  }

  return (
    <div
      className={`nav-inline-search-container ${isExpanded ? 'is-expanded' : 'is-collapsed'}`}
      ref={containerRef}
    >
      {!isExpanded ? (
        /* 1. Collapsed State: Interactive Button */
        <button
          type="button"
          className="nav-search-collapsed-pill"
          onClick={() => setIsExpanded(true)}
          aria-label="Open search bar (Ctrl + K)"
          title="Search lessons, articles, acts (Ctrl + K)"
        >
          <Search size={15} className="nav-search-icon text-gold" aria-hidden="true" />
          <span className="nav-search-collapsed-label">Search lessons, articles, acts...</span>
          <span className="search-shortcut-badge" aria-hidden="true">
            <kbd className="kbd-key">Ctrl</kbd> <kbd className="kbd-key">K</kbd>
          </span>
        </button>
      ) : (
        /* 2. Expanded State: Full Input Bar with controls */
        <div className="nav-search-expanded-wrapper">
          <form className="nav-search-form-pill" onSubmit={handleSubmit} role="search">
            <Search size={15} className="nav-search-icon text-gold" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              className="nav-search-input-field"
              placeholder="Search lessons, articles, acts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search lessons, articles, acts"
              autoComplete="off"
            />

            {isDebouncing && (
              <Loader2 size={13} className="nav-search-spinner animate-spin" aria-label="Searching..." />
            )}

            {query && (
              <button
                type="button"
                className="nav-search-clear-btn"
                onClick={() => {
                  setQuery('')
                  inputRef.current?.focus()
                }}
                aria-label="Clear search input"
              >
                <X size={13} aria-hidden="true" />
              </button>
            )}

            <button
              type="button"
              className="nav-search-collapse-close-btn"
              onClick={() => setIsExpanded(false)}
              aria-label="Close search bar"
              title="Close search (Esc)"
            >
              <X size={15} aria-hidden="true" />
            </button>
          </form>

          {/* Instant Dropdown Results Menu */}
          {results.length > 0 && (
            <div className="nav-search-dropdown-menu samvidhan-glow-card" role="listbox">
              <div className="dropdown-category-title">Instant Results</div>
              <ul className="dropdown-results-list">
                {results.slice(0, 5).map((item) => (
                  <li key={item.id} className="dropdown-result-item" role="option">
                    <button
                      type="button"
                      className="dropdown-result-btn"
                      onClick={() => handleSelectResult(item.to)}
                    >
                      <div className="dropdown-icon-pill">
                        {item.category === 'Lesson' && <BookOpen size={14} className="text-gold" />}
                        {item.category === 'Constitution' && <Landmark size={14} className="text-gold" />}
                        {item.category === 'Library' && <FileText size={14} className="text-gold" />}
                      </div>
                      <div className="dropdown-text-col">
                        <div className="dropdown-item-top">
                          <strong className="dropdown-item-title">{item.title}</strong>
                          <span className="dropdown-category-tag">{item.category}</span>
                        </div>
                        <span className="dropdown-item-snippet">{item.snippet}</span>
                      </div>
                      <ArrowRight size={14} className="dropdown-arrow-icon" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="dropdown-view-all-footer">
                <button
                  type="button"
                  className="dropdown-full-search-link"
                  onClick={handleSubmit}
                >
                  <span>See all matches for "{query}"</span>
                  <ArrowRight size={13} aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
