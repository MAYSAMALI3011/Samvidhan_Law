import React, { useState } from 'react'
import {
  Plus,
    CheckCircle2,
    Trash2,
  Edit,
  Eye,
  Download,
      X,
  Save,
  Check,
  Search,
} from 'lucide-react'
import { adminService, type AdminContentItem } from '../../services/adminService'
import { useAdminContext } from './AdminLayout'

export function AdminContentManager() {
  const [items, setItems] = useState<AdminContentItem[]>(() => adminService.getContentItems())
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [previewItem, setPreviewItem] = useState<AdminContentItem | null>(null)
  const [editItem, setEditItem] = useState<Partial<AdminContentItem> | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const { demoRole } = useAdminContext()
  const canEdit = ['superadmin', 'admin', 'editor'].includes(demoRole)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const filteredItems = items.filter((item) => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.citation.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || item.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editItem?.title || !editItem?.citation) {
      alert('Title and Statutory Citation are required.')
      return
    }

    const newItem: AdminContentItem = {
      id: editItem.id || `lesson-${Math.random().toString(36).slice(2, 8)}`,
      unitId: editItem.unitId || 1,
      title: editItem.title,
      type: 'lesson',
      status: (editItem.status as any) || 'Draft',
      citation: editItem.citation,
      author: editItem.author || 'Editorial Team',
      updatedAt: new Date().toISOString().split('T')[0],
      contentPreview: editItem.contentPreview || 'Constitutional lesson breakdown.',
    }

    adminService.saveContentItem(newItem)
    setItems(adminService.getContentItems())
    setEditItem(null)
    showToast('Content saved successfully!')
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this content item?')) return
    adminService.deleteContentItem(id)
    setItems(adminService.getContentItems())
    if (previewItem?.id === id) setPreviewItem(null)
    showToast('Item deleted from store.')
  }

  const handleExportJson = () => {
    const json = JSON.stringify(items, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'samvidhan-content-export.json'
    a.click()
  }

  return (
    <div className="admin-page">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="admin-toast-banner" role="alert">
          <Check size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="admin-page-head">
        <div>
          <span className="admin-eyebrow">Content Repository</span>
          <h1 className="admin-page-title">Curriculum &amp; Lesson Management</h1>
          <p className="admin-subtext">Manage constitutional modules, interactive cards, and verified statutory citations.</p>
        </div>

        <div className="admin-head-action">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleExportJson}
            title="Export content to JSON"
          >
            <Download size={14} />
            <span>Export JSON</span>
          </button>

          {canEdit && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() =>
                setEditItem({
                  title: '',
                  citation: '',
                  unitId: 1,
                  status: 'Draft',
                  contentPreview: '',
                  author: 'Legal Editor',
                })
              }
            >
              <Plus size={16} />
              <span>Create New Lesson</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-filter-bar samvidhan-glow-card">
        <div className="admin-search-wrap">
          <Search size={16} className="search-icon text-gold" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search lessons, statutory articles, keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="admin-status-filters">
          {['All', 'Published', 'In Review', 'Draft'].map((status) => (
            <button
              key={status}
              type="button"
              className={`admin-filter-tab ${statusFilter === status ? 'is-active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Table + Side-by-side Preview */}
      <div className="admin-content-layout">
        <div className="admin-table-container samvidhan-glow-card">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Title &amp; Module</th>
                <th>Statutory Citation</th>
                <th>Status</th>
                <th>Updated</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className={previewItem?.id === item.id ? 'is-previewing' : ''}>
                  <td>
                    <strong className="table-item-title">{item.title}</strong>
                    <span className="table-item-sub">Unit {item.unitId} ? {item.author}</span>
                  </td>
                  <td>
                    <span className="table-citation-badge">{item.citation}</span>
                  </td>
                  <td>
                    <span className={`status-pill status-${item.status.toLowerCase().replace(' ', '-')}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <span className="table-date">{item.updatedAt}</span>
                  </td>
                  <td>
                    <div className="table-actions-row">
                      <button
                        type="button"
                        className="table-action-btn"
                        onClick={() => setPreviewItem(item)}
                        title="Live learner preview side-by-side"
                      >
                        <Eye size={15} />
                      </button>

                      {canEdit && (
                        <button
                          type="button"
                          className="table-action-btn"
                          onClick={() => setEditItem(item)}
                          title="Edit content"
                        >
                          <Edit size={15} />
                        </button>
                      )}

                      {canEdit && (
                        <button
                          type="button"
                          className="table-action-btn delete-btn"
                          onClick={() => handleDelete(item.id)}
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Side-by-Side Live Learner Preview Pane */}
        {previewItem && (
          <div className="admin-preview-pane samvidhan-glow-card">
            <div className="preview-pane-head">
              <div className="preview-pane-title">
                <Eye size={16} className="text-gold" />
                <span>Live Learner Preview</span>
              </div>
              <button
                type="button"
                className="preview-close-btn"
                onClick={() => setPreviewItem(null)}
                aria-label="Close preview"
              >
                <X size={18} />
              </button>
            </div>

            <div className="preview-pane-body">
              <span className="preview-kicker">UNIT {previewItem.unitId} &bull; CONSTITUTION OF INDIA</span>
              <h2 className="preview-title">{previewItem.title}</h2>
              <div className="preview-citation-box">
                <strong>Statutory Anchor:</strong> {previewItem.citation}
              </div>

              <div className="preview-learner-card">
                <p className="preview-explanation">{previewItem.contentPreview}</p>
                <div className="preview-takeaway">
                  <strong>Key Takeaway:</strong> Constitutional rights are self-executing against arbitrary state overreach.
                </div>
              </div>

              <div className="preview-readability-check">
                <CheckCircle2 size={16} className="text-emerald" />
                <span>Readability: Plain-English (Civic Grade 8) &bull; Verified Citation Present</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit / Create Modal */}
      {editItem && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="editor-title">
          <div className="admin-modal samvidhan-glow-card">
            <div className="admin-modal-head">
              <h3 id="editor-title">{editItem.id ? 'Edit Lesson' : 'Create New Lesson'}</h3>
              <button type="button" className="preview-close-btn" onClick={() => setEditItem(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="admin-modal-form">
              <div className="field-block">
                <label htmlFor="item-title" className="field-label">Lesson Title</label>
                <input
                  id="item-title"
                  type="text"
                  required
                  className="field-input"
                  placeholder="e.g. Article 21: Protection of Life and Personal Liberty"
                  value={editItem.title || ''}
                  onChange={(e) => setEditItem({ ...editItem, title: e.target.value })}
                />
              </div>

              <div className="field-block">
                <label htmlFor="item-citation" className="field-label">
                  Mandatory Statutory Citation (Article / Central Act / Precedent)
                </label>
                <input
                  id="item-citation"
                  type="text"
                  required
                  className="field-input"
                  placeholder="e.g. Article 21 &bull; Maneka Gandhi v. Union of India (1978)"
                  value={editItem.citation || ''}
                  onChange={(e) => setEditItem({ ...editItem, citation: e.target.value })}
                />
              </div>

              <div className="field-grid-2">
                <div className="field-block">
                  <label htmlFor="item-unit" className="field-label">Unit</label>
                  <select
                    id="item-unit"
                    className="field-input"
                    value={editItem.unitId || 1}
                    onChange={(e) => setEditItem({ ...editItem, unitId: parseInt(e.target.value, 10) })}
                  >
                    <option value={1}>Unit 1: The Preamble</option>
                    <option value={2}>Unit 2: Fundamental Rights</option>
                    <option value={3}>Unit 3: Daily Citizen Protections</option>
                  </select>
                </div>

                <div className="field-block">
                  <label htmlFor="item-status" className="field-label">Workflow Status</label>
                  <select
                    id="item-status"
                    className="field-input"
                    value={editItem.status || 'Draft'}
                    onChange={(e) => setEditItem({ ...editItem, status: e.target.value as any })}
                  >
                    <option value="Draft">Draft</option>
                    <option value="In Review">In Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Published">Published</option>
                  </select>
                </div>
              </div>

              <div className="field-block">
                <label htmlFor="item-preview" className="field-label">Plain-Language Summary</label>
                <textarea
                  id="item-preview"
                  rows={4}
                  className="field-input"
                  placeholder="Explain the legal principle in simple sentences that an ordinary citizen can understand..."
                  value={editItem.contentPreview || ''}
                  onChange={(e) => setEditItem({ ...editItem, contentPreview: e.target.value })}
                />
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditItem(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} />
                  <span>Save Lesson</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
