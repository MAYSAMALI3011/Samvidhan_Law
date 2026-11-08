import React, { useState, useEffect, useRef, useId } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  X,
  BookOpen,
  Landmark,
  FileText,
  Scale,
  Sparkles,
  ArrowRight,
  Clock,
  CornerDownLeft,
  Settings,
  Compass,
} from 'lucide-react'
import { searchAll } from '../../services/catalog'
import { useTheme } from '../../context/useTheme'
import type { Lesson, ConstitutionTopic, LibraryDocument } from '../../types'

interface SearchPaletteProps {
  isOpen: boolean
  onClose: () => void
  onAskSamvidhan?: (query: string) => void
}

interface SearchItem {
  id: string
  group: 'Lessons' | 'Constitution' | 'Acts & Statutes' | 'Case Law' | 'Pages' | 'Settings'
  title: string
  subtitle: string
  to: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

const popularSearches = [
  'Article 21 Life & Liberty',
  'Right to Information (RTI)',
  'D.K. Basu Arrest Guidelines',
  'Consumer Court Protection',
  'Article 14 Equality Doctrine',
  'Tenant & Eviction Safeguards',
]

const staticPages: SearchItem[] = [
  { id: 'p-home', group: 'Pages', title: 'Home Overview', subtitle: 'Platform overview, Preamble & civic rights', to: '/', icon: Compass },
  { id: 'p-curriculum', group: 'Pages', title: 'Curriculum & Courses', subtitle: 'Explore 6 structured legal masterclasses', to: '/learn', icon: BookOpen },
  { id: 'p-constitution', group: 'Pages', title: 'The Constitution of India', subtitle: 'Browse Articles, Parts, and Schedules', to: '/constitution', icon: Landmark },
  { id: 'p-library', group: 'Pages', title: 'Statutory Library', subtitle: 'Checklists, RTI templates, and Acts', to: '/library', icon: FileText },
  { id: 'p-dashboard', group: 'Pages', title: 'Learner Dashboard', subtitle: 'Track progress, streaks, and bookmarks', to: '/dashboard', icon: Sparkles },
  { id: 'p-principles', group: 'Pages', title: 'Design Principles', subtitle: 'Quiet luxury and sovereign legal UX', to: '/design-principles', icon: Scale },
]

const landmarkCases: SearchItem[] = [
  { id: 'c-dkbasu', group: 'Case Law', title: 'D.K. Basu v. State of West Bengal (1997)', subtitle: 'Mandatory Supreme Court guidelines on police arrest and custody', to: '/library/fir-checklist', icon: Scale },
  { id: 'c-maneka', group: 'Case Law', title: 'Maneka Gandhi v. Union of India (1978)', subtitle: 'Article 21 procedure established by law must be just, fair & reasonable', to: '/constitution/part-iii', icon: Scale },
  { id: 'c-puttaswamy', group: 'Case Law', title: 'K.S. Puttaswamy v. Union of India (2017)', subtitle: 'Unanimous 9-judge bench recognized Right to Privacy under Article 21', to: '/constitution/part-iii', icon: Scale },
  { id: 'c-kesavananda', group: 'Case Law', title: 'Kesavananda Bharati v. State of Kerala (1973)', subtitle: 'Basic Structure Doctrine restricting parliamentary amending power', to: '/constitution', icon: Scale },
]

export function SearchPalette({ isOpen, onClose, onAskSamvidhan }: SearchPaletteProps) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchItem[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('samvidhan-recent-searches') || '[]')
    } catch {
      return []
    }
  })

  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { toggleTheme, theme } = useTheme()
  const inputId = useId()

  // Reset & focus on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setQuery('')
        setResults([])
        setSelectedIndex(0)
        inputRef.current?.focus()
      }, 20)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Debounced Search Execution
  useEffect(() => {
    const trimmed = query.trim()
    const timer = setTimeout(async () => {
      if (!trimmed) {
        setResults([])
        setLoading(false)
        return
      }
      setLoading(true)
      const qLower = trimmed.toLowerCase()
      const data = await searchAll(trimmed)

      const items: SearchItem[] = []

      // Lessons
      data.lessons.slice(0, 4).forEach((l: Lesson) => {
        items.push({
          id: `l-${l.id}`,
          group: 'Lessons',
          title: l.title,
          subtitle: `Lesson · ${l.durationMinutes} min read`,
          to: `/learn/${l.courseId}/${l.id}`,
          icon: BookOpen,
        })
      })

      // Constitution Articles / Topics
      data.topics.slice(0, 4).forEach((t: ConstitutionTopic) => {
        items.push({
          id: `t-${t.id}`,
          group: 'Constitution',
          title: t.title,
          subtitle: `${t.part} · Constitutional Provisions`,
          to: `/constitution/${t.id}`,
          icon: Landmark,
        })
      })

      // Library / Acts
      data.documents.slice(0, 3).forEach((d: LibraryDocument) => {
        items.push({
          id: `d-${d.id}`,
          group: 'Acts & Statutes',
          title: d.title,
          subtitle: `${d.category} · ${d.sourceLabel}`,
          to: `/library/${d.id}`,
          icon: FileText,
        })
      })

      // Case Law matches
      landmarkCases.forEach((c) => {
        if (c.title.toLowerCase().includes(qLower) || c.subtitle.toLowerCase().includes(qLower)) {
          items.push(c)
        }
      })

      // Static pages match
      staticPages.forEach((p) => {
        if (p.title.toLowerCase().includes(qLower) || p.subtitle.toLowerCase().includes(qLower)) {
          items.push(p)
        }
      })

      // Settings actions
      if (qLower.includes('theme') || qLower.includes('dark') || qLower.includes('light')) {
        items.push({
          id: 'set-theme',
          group: 'Settings',
          title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
          subtitle: 'Toggle platform theme aesthetic',
          to: '#action-theme',
          icon: Settings,
        })
      }

      setResults(items)
      setSelectedIndex(0)
      setLoading(false)
    }, 150)

    return () => clearTimeout(timer)
  }, [query, theme])

  // Save Recent Search
  const addRecentSearch = (term: string) => {
    const updated = [term, ...recentSearches.filter((s) => s.toLowerCase() !== term.toLowerCase())].slice(0, 5)
    setRecentSearches(updated)
    try {
      localStorage.setItem('samvidhan-recent-searches', JSON.stringify(updated))
    } catch {
      // ignore
    }
  }

  // Handle item activation
  const handleSelect = (item: SearchItem) => {
    addRecentSearch(query || item.title)
    onClose()
    if (item.to === '#action-theme') {
      toggleTheme()
    } else {
      navigate(item.to)
    }
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
      return
    }

    if (results.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % results.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex])
        }
      }
    } else if (e.key === 'Enter' && query.trim() && onAskSamvidhan) {
      e.preventDefault()
      onClose()
      onAskSamvidhan(query)
    }
  }

  // Scroll active into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[aria-selected="true"]') as HTMLElement | null
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  if (!isOpen) return null

  // Highlight matching text helper
  const renderHighlighted = (text: string, highlight: string) => {
    if (!highlight.trim()) return text
    const parts = text.split(new RegExp(`(${highlight.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <mark key={i} className="search-highlight">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  // Group results
  const groupedResults = results.reduce<Record<string, SearchItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = []
    acc[item.group].push(item)
    return acc
  }, {})

  let itemCursor = -1

  return (
    <div
      className="palette-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="palette-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Search Samvidhan"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="palette-input-wrap">
          <Search size={20} className="palette-search-icon" aria-hidden="true" />
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            className="palette-input"
            role="combobox"
            aria-expanded="true"
            aria-autocomplete="list"
            aria-controls="palette-results-list"
            aria-activedescendant={results[selectedIndex] ? results[selectedIndex].id : undefined}
            placeholder="Search articles, statutes, masterclasses, or legal rights..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query ? (
            <button
              type="button"
              className="palette-clear-btn"
              onClick={() => {
                setQuery('')
                inputRef.current?.focus()
              }}
              aria-label="Clear search"
            >
              <X size={16} aria-hidden="true" />
            </button>
          ) : (
            <kbd className="palette-esc-badge" aria-hidden="true">
              ESC
            </kbd>
          )}
        </div>

        {/* Results Container */}
        <div className="palette-body" ref={listRef} id="palette-results-list" role="listbox">
          {loading && (
            <div className="palette-skeletons" aria-busy="true" aria-label="Loading results">
              {[1, 2, 3].map((n) => (
                <div key={n} className="palette-skeleton-row">
                  <div className="palette-skeleton-icon skeleton" />
                  <div className="palette-skeleton-lines">
                    <div className="palette-skeleton-line-1 skeleton" />
                    <div className="palette-skeleton-line-2 skeleton" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="palette-no-results">
              <div className="palette-no-results-icon">
                <Scale size={32} aria-hidden="true" />
              </div>
              <h4>No direct statutory provisions found for &ldquo;{query}&rdquo;</h4>
              <p>Would you like to ask our civic AI research assistant?</p>
              {onAskSamvidhan && (
                <button
                  type="button"
                  className="btn btn-primary palette-ask-btn"
                  onClick={() => {
                    onClose()
                    onAskSamvidhan(query)
                  }}
                >
                  <Sparkles size={16} aria-hidden="true" />
                  <span>Ask Samvidhan about &ldquo;{query}&rdquo;</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
              )}
            </div>
          )}

          {!loading && !query && (
            <div className="palette-empty-state">
              {recentSearches.length > 0 && (
                <div className="palette-section">
                  <div className="palette-section-head">
                    <Clock size={13} aria-hidden="true" />
                    <span>Recent Searches</span>
                  </div>
                  <div className="palette-chips">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        type="button"
                        className="palette-chip"
                        onClick={() => setQuery(term)}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="palette-section">
                <div className="palette-section-head">
                  <Sparkles size={13} aria-hidden="true" />
                  <span>Popular Legal Queries</span>
                </div>
                <div className="palette-chips">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      className="palette-chip"
                      onClick={() => setQuery(term)}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              <div className="palette-section">
                <div className="palette-section-head">
                  <Compass size={13} aria-hidden="true" />
                  <span>Quick Navigation</span>
                </div>
                <div className="palette-quick-grid">
                  {staticPages.slice(0, 4).map((p) => {
                    const Icon = p.icon
                    return (
                      <button
                        key={p.id}
                        type="button"
                        className="palette-quick-card"
                        onClick={() => handleSelect(p)}
                      >
                        <Icon size={16} className="palette-quick-icon" aria-hidden="true" />
                        <span>{p.title}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="palette-results-grouped">
              {Object.entries(groupedResults).map(([groupName, items]) => (
                <div key={groupName} className="palette-group">
                  <div className="palette-group-title">{groupName}</div>
                  <div className="palette-group-items">
                    {items.map((item) => {
                      itemCursor++
                      const isSelected = itemCursor === selectedIndex
                      const Icon = item.icon
                      const thisIndex = itemCursor

                      return (
                        <div
                          key={item.id}
                          id={item.id}
                          role="option"
                          aria-selected={isSelected}
                          className={`palette-item ${isSelected ? 'is-selected' : ''}`}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setSelectedIndex(thisIndex)}
                        >
                          <div className="palette-item-icon-wrap">
                            <Icon size={17} aria-hidden="true" />
                          </div>
                          <div className="palette-item-content">
                            <div className="palette-item-title">
                              {renderHighlighted(item.title, query)}
                            </div>
                            <div className="palette-item-subtitle">
                              {item.subtitle}
                            </div>
                          </div>
                          <div className="palette-item-arrow" aria-hidden="true">
                            <CornerDownLeft size={14} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Hints */}
        <div className="palette-footer">
          <div className="palette-hint">
            <kbd className="palette-kbd">&uarr;</kbd>
            <kbd className="palette-kbd">&uarr;</kbd>
            <span>Navigate</span>
          </div>
          <div className="palette-hint">
            <kbd className="palette-kbd">&uarr;</kbd>
            <span>Select</span>
          </div>
          <div className="palette-hint">
            <kbd className="palette-kbd">ESC</kbd>
            <span>Close</span>
          </div>
        </div>
      </div>
    </div>
  )
}
