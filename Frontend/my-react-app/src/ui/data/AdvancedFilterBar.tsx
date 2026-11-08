import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, X, RotateCcw, Bookmark, Check } from 'lucide-react'
import './data.css'

export interface FilterOption {
  value: string
  label: string
}

export interface FilterConfig {
  key: string
  label: string
  options: FilterOption[]
}

export interface AdvancedFilterBarProps {
  configs: FilterConfig[]
  activeFilters: Record<string, string>
  onFilterChange: (filters: Record<string, string>) => void
  totalCount: number
  filteredCount: number
  storageKey?: string
}

export function AdvancedFilterBar({
  configs,
  activeFilters,
  onFilterChange,
  totalCount,
  filteredCount,
  storageKey = 'samvidhan-saved-filters',
}: AdvancedFilterBarProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [savedViews, setSavedViews] = useState<Record<string, Record<string, string>>>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '{}')
    } catch {
      return {}
    }
  })
  const [viewNameInput, setViewNameInput] = useState('')
  const [showSaveView, setShowSaveView] = useState(false)

  const hasMountedRef = useRef(false)

  // Sync from URL search params on mount
  useEffect(() => {
    if (hasMountedRef.current) return
    hasMountedRef.current = true
    const fromUrl: Record<string, string> = {}
    configs.forEach((cfg) => {
      const val = searchParams.get(cfg.key)
      if (val) fromUrl[cfg.key] = val
    })
    if (Object.keys(fromUrl).length > 0) {
      onFilterChange({ ...activeFilters, ...fromUrl })
    }
  }, [configs, searchParams, onFilterChange, activeFilters])

  const handleSelect = (key: string, value: string) => {
    const updated = { ...activeFilters }
    if (!value || value === 'all') {
      delete updated[key]
      searchParams.delete(key)
    } else {
      updated[key] = value
      searchParams.set(key, value)
    }
    setSearchParams(searchParams, { replace: true })
    onFilterChange(updated)
  }

  const handleRemoveChip = (key: string) => {
    handleSelect(key, 'all')
  }

  const handleResetAll = () => {
    configs.forEach((cfg) => searchParams.delete(cfg.key))
    setSearchParams(searchParams, { replace: true })
    onFilterChange({})
  }

  const handleSaveCurrentView = () => {
    if (!viewNameInput.trim()) return
    const updated = { ...savedViews, [viewNameInput.trim()]: activeFilters }
    setSavedViews(updated)
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated))
    } catch {
      /* ignore storage error */
    }
    setViewNameInput('')
    setShowSaveView(false)
  }

  const handleApplySavedView = (viewFilters: Record<string, string>) => {
    // update URL
    configs.forEach((cfg) => searchParams.delete(cfg.key))
    Object.entries(viewFilters).forEach(([k, v]) => searchParams.set(k, v))
    setSearchParams(searchParams, { replace: true })
    onFilterChange(viewFilters)
  }

  const activeKeys = Object.keys(activeFilters).filter((k) => activeFilters[k])
  const hasActiveFilters = activeKeys.length > 0

  return (
    <div className="advanced-filter-bar samvidhan-glow-card">
      {/* Filter Select Dropdowns & Quick Controls */}
      <div className="filter-controls-row">
        <div className="filter-dropdowns-group">
          <div className="filter-label-icon">
            <Filter size={15} className="text-gold" aria-hidden="true" />
            <span>Filter by:</span>
          </div>

          {configs.map((cfg) => (
            <div key={cfg.key} className="filter-select-wrapper">
              <select
                value={activeFilters[cfg.key] || 'all'}
                onChange={(e) => handleSelect(cfg.key, e.target.value)}
                className="filter-select"
                aria-label={cfg.label}
              >
                <option value="all">All {cfg.label}</option>
                {cfg.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* View actions: Reset all, Save view */}
        <div className="filter-actions-right">
          {hasActiveFilters && (
            <button
              type="button"
              className="filter-reset-btn"
              onClick={handleResetAll}
              title="Reset all active filters"
            >
              <RotateCcw size={13} />
              <span>Reset all</span>
            </button>
          )}

          <button
            type="button"
            className="filter-save-view-btn"
            onClick={() => setShowSaveView(!showSaveView)}
            title="Save current filters as custom view"
          >
            <Bookmark size={13} />
            <span>Save View</span>
          </button>
        </div>
      </div>

      {/* Save View Inline Popup */}
      {showSaveView && (
        <div className="save-view-inline-panel">
          <input
            type="text"
            className="save-view-input"
            placeholder="Name your view (e.g. Criminal Law 1950)"
            value={viewNameInput}
            onChange={(e) => setViewNameInput(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSaveCurrentView}
            disabled={!viewNameInput.trim()}
          >
            <Check size={13} />
            <span>Save</span>
          </button>
        </div>
      )}

      {/* Active Filter Chips & Saved View Tabs */}
      <div className="filter-chips-row">
        <div className="chips-list">
          {activeKeys.map((key) => {
            const cfg = configs.find((c) => c.key === key)
            const opt = cfg?.options.find((o) => o.value === activeFilters[key])
            const label = opt ? opt.label : activeFilters[key]

            return (
              <span key={key} className="filter-chip">
                <span className="chip-category">{cfg?.label || key}:</span>
                <span className="chip-val">{label}</span>
                <button
                  type="button"
                  className="chip-remove-btn"
                  onClick={() => handleRemoveChip(key)}
                  aria-label={`Remove filter ${label}`}
                >
                  <X size={12} />
                </button>
              </span>
            )
          })}
        </div>

        <span className="filter-result-counter">
          Showing <strong>{filteredCount}</strong> of <strong>{totalCount}</strong> guides
        </span>
      </div>

      {/* Saved views pills if any exist */}
      {Object.keys(savedViews).length > 0 && (
        <div className="saved-views-strip">
          <span className="saved-views-title">Saved views:</span>
          {Object.entries(savedViews).map(([name, filters]) => (
            <button
              key={name}
              type="button"
              className="saved-view-pill"
              onClick={() => handleApplySavedView(filters)}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
