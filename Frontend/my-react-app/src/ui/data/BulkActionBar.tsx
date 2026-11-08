import React from 'react'
import { Trash2, Download, FolderPlus, X } from 'lucide-react'
import './data.css'

export interface BulkActionItem {
  id: string
  label: string
  icon?: React.ComponentType<{ size?: number; className?: string }>
  danger?: boolean
  onClick: (selectedIds: string[]) => void
}

export interface BulkActionBarProps {
  selectedIds: string[]
  totalCount: number
  onClearSelection: () => void
  onSelectAll?: () => void
  actions?: BulkActionItem[]
  onDeleteSelected?: (selectedIds: string[]) => void
  onExportSelected?: (selectedIds: string[]) => void
  onAddToCollection?: (selectedIds: string[]) => void
}

export function BulkActionBar({
  selectedIds,
  totalCount,
  onClearSelection,
  onSelectAll,
  actions,
  onDeleteSelected,
  onExportSelected,
  onAddToCollection,
}: BulkActionBarProps) {
  if (selectedIds.length === 0) return null

  const isAllSelected = selectedIds.length === totalCount && totalCount > 0

  return (
    <div
      className="bulk-action-bar-container"
      role="region"
      aria-label="Bulk actions toolbar"
    >
      <div className="bulk-action-bar-inner samvidhan-glow-card">
        <div className="bulk-selection-meta">
          <span className="bulk-count-badge">{selectedIds.length}</span>
          <span className="bulk-selected-label">
            {selectedIds.length === 1 ? 'item selected' : 'items selected'}
          </span>

          {onSelectAll && !isAllSelected && (
            <button
              type="button"
              className="bulk-select-all-btn"
              onClick={onSelectAll}
            >
              Select all ({totalCount})
            </button>
          )}
        </div>

        <div className="bulk-actions-group">
          {actions ? (
            actions.map((act) => {
              const Icon = act.icon
              return (
                <button
                  key={act.id}
                  type="button"
                  className={`bulk-btn ${act.danger ? 'bulk-btn-danger' : 'bulk-btn-secondary'}`}
                  onClick={() => act.onClick(selectedIds)}
                >
                  {Icon && <Icon size={14} aria-hidden="true" />}
                  <span>{act.label}</span>
                </button>
              )
            })
          ) : (
            <>
              {onAddToCollection && (
                <button
                  type="button"
                  className="bulk-btn bulk-btn-secondary"
                  onClick={() => onAddToCollection(selectedIds)}
                  title="Add selected to collection"
                >
                  <FolderPlus size={14} aria-hidden="true" />
                  <span>Add to Collection</span>
                </button>
              )}

              {onExportSelected && (
                <button
                  type="button"
                  className="bulk-btn bulk-btn-secondary"
                  onClick={() => onExportSelected(selectedIds)}
                  title="Export selected as JSON/CSV"
                >
                  <Download size={14} aria-hidden="true" />
                  <span>Export</span>
                </button>
              )}

              {onDeleteSelected && (
                <button
                  type="button"
                  className="bulk-btn bulk-btn-danger"
                  onClick={() => onDeleteSelected(selectedIds)}
                  title="Delete selected items"
                >
                  <Trash2 size={14} aria-hidden="true" />
                  <span>Delete</span>
                </button>
              )}
            </>
          )}

          <div className="bulk-action-divider" aria-hidden="true" />

          <button
            type="button"
            className="bulk-close-btn"
            onClick={onClearSelection}
            aria-label="Deselect all items"
            title="Deselect all"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
