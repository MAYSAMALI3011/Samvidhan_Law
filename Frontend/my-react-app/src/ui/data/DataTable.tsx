import { useState, useMemo } from 'react'
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react'
import './data.css'

export interface Column<T> {
  key: string
  header: string
  render?: (item: T) => React.ReactNode
  sortable?: boolean
  sortValue?: (item: T) => string | number
  hideable?: boolean
  defaultHidden?: boolean
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T) => string
  selectable?: boolean
  selectedIds?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
  pageSize?: number
  emptyState?: React.ReactNode
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  pageSize: initialPageSize = 10,
  emptyState,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [hiddenKeys, setHiddenKeys] = useState<string[]>(() =>
    columns.filter((c) => c.defaultHidden).map((c) => c.key)
  )
  const [showColMenu, setShowColMenu] = useState(false)
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null)

  // Visible columns
  const visibleColumns = useMemo(
    () => columns.filter((c) => !hiddenKeys.includes(c.key)),
    [columns, hiddenKeys]
  )

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return data
    const col = columns.find((c) => c.key === sortKey)
    if (!col) return data

    return [...data].sort((a, b) => {
      const valA = col.sortValue ? col.sortValue(a) : a[sortKey]
      const valB = col.sortValue ? col.sortValue(b) : b[sortKey]

      if (valA == null) return 1
      if (valB == null) return -1
      if (valA < valB) return sortDir === 'asc' ? -1 : 1
      if (valA > valB) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [data, sortKey, sortDir, columns])

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, currentPage, pageSize])

  const handleHeaderClick = (col: Column<T>) => {
    if (!col.sortable) return
    if (sortKey === col.key) {
      if (sortDir === 'asc') setSortDir('desc')
      else {
        setSortKey(null)
        setSortDir('asc')
      }
    } else {
      setSortKey(col.key)
      setSortDir('asc')
    }
  }

  // Row selection with Shift+Click range
  const handleSelectRow = (id: string, index: number, shiftKey: boolean) => {
    if (!onSelectionChange) return

    if (shiftKey && lastSelectedIndex !== null) {
      const start = Math.min(lastSelectedIndex, index)
      const end = Math.max(lastSelectedIndex, index)
      const rangeIds = paginatedData.slice(start, end + 1).map((item) => keyExtractor(item))
      const combined = Array.from(new Set([...selectedIds, ...rangeIds]))
      onSelectionChange(combined)
    } else {
      if (selectedIds.includes(id)) {
        onSelectionChange(selectedIds.filter((item) => item !== id))
      } else {
        onSelectionChange([...selectedIds, id])
      }
      setLastSelectedIndex(index)
    }
  }

  const handleSelectAllOnPage = () => {
    if (!onSelectionChange) return
    const pageIds = paginatedData.map((item) => keyExtractor(item))
    const isAllPageSelected = pageIds.every((id) => selectedIds.includes(id))

    if (isAllPageSelected) {
      onSelectionChange(selectedIds.filter((id) => !pageIds.includes(id)))
    } else {
      onSelectionChange(Array.from(new Set([...selectedIds, ...pageIds])))
    }
  }

  const isAllPageSelected =
    paginatedData.length > 0 && paginatedData.every((item) => selectedIds.includes(keyExtractor(item)))

  return (
    <div className="data-table-wrapper samvidhan-glow-card">
      {/* Table Toolbar */}
      <div className="data-table-top-toolbar">
        <span className="table-count-label">
          Showing <strong>{paginatedData.length}</strong> of <strong>{data.length}</strong> records
        </span>

        {/* Column Visibility Toggle */}
        <div className="table-col-visibility-wrapper">
          <button
            type="button"
            className="table-col-visibility-btn"
            onClick={() => setShowColMenu(!showColMenu)}
            aria-expanded={showColMenu}
            aria-label="Toggle visible columns"
          >
            <Eye size={14} aria-hidden="true" />
            <span>Columns</span>
          </button>

          {showColMenu && (
            <div className="table-col-menu samvidhan-glow-card">
              <span className="table-col-menu-title">Display Columns</span>
              {columns
                .filter((c) => c.hideable !== false)
                .map((c) => {
                  const isVisible = !hiddenKeys.includes(c.key)
                  return (
                    <label key={c.key} className="table-col-checkbox-label">
                      <input
                        type="checkbox"
                        checked={isVisible}
                        onChange={() => {
                          if (isVisible) {
                            if (visibleColumns.length > 1) {
                              setHiddenKeys([...hiddenKeys, c.key])
                            }
                          } else {
                            setHiddenKeys(hiddenKeys.filter((k) => k !== c.key))
                          }
                        }}
                      />
                      <span>{c.header}</span>
                    </label>
                  )
                })}
            </div>
          )}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="data-table-scroll-container">
        <table className="data-table" role="table">
          <thead className="data-table-header">
            <tr>
              {selectable && (
                <th className="th-checkbox">
                  <input
                    type="checkbox"
                    checked={isAllPageSelected}
                    onChange={handleSelectAllOnPage}
                    aria-label="Select all on current page"
                  />
                </th>
              )}
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  className={`th-cell ${col.sortable ? 'is-sortable' : ''}`}
                  onClick={() => handleHeaderClick(col)}
                  role={col.sortable ? 'columnheader' : undefined}
                  aria-sort={
                    sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined
                  }
                >
                  <div className="th-content">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="th-sort-icon">
                        {sortKey === col.key ? (
                          sortDir === 'asc' ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )
                        ) : (
                          <ChevronsUpDown size={14} className="th-sort-idle" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + (selectable ? 1 : 0)}>
                  <div className="table-empty-wrap">{emptyState || <p>No records found.</p>}</div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, idx) => {
                const id = keyExtractor(item)
                const isSelected = selectedIds.includes(id)

                return (
                  <tr
                    key={id}
                    className={`data-table-row ${isSelected ? 'is-selected-row' : ''}`}
                  >
                    {selectable && (
                      <td className="td-checkbox">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(id, idx, (e.nativeEvent as MouseEvent).shiftKey)}
                          aria-label={`Select row ${id}`}
                        />
                      </td>
                    )}
                    {visibleColumns.map((col) => (
                      <td key={col.key} className="td-cell" data-label={col.header}>
                        {col.render ? col.render(item) : String(item[col.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="data-table-pagination">
          <div className="page-size-selector">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="page-size-select"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
            </select>
          </div>

          <div className="pagination-controls">
            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="pagination-status">
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>
            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
