import { useState } from 'react'
import { CheckCircle, Send, Check } from 'lucide-react'
import { adminService, type MistakeReport } from '../../services/adminService'

export function AdminReports() {
  const [reports, setReports] = useState<MistakeReport[]>(() => adminService.getReports())
  const [activeReport, setActiveReport] = useState<MistakeReport | null>(null)
  const [replyText, setReplyText] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const handleStatusChange = (id: string, status: MistakeReport['status']) => {
    adminService.updateReportStatus(id, status)
    setReports(adminService.getReports())
    setToast(`Report status updated to ${status}`)
    setTimeout(() => setToast(null), 3000)
  }

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeReport) return
    adminService.updateReportStatus(activeReport.id, 'Fixed')
    setReports(adminService.getReports())
    setActiveReport(null)
    setReplyText('')
    setToast('Reply sent and report marked as Fixed!')
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="admin-page">
      {toast && (
        <div className="admin-toast-banner" role="alert">
          <Check size={16} />
          <span>{toast}</span>
        </div>
      )}

      <div className="admin-page-head">
        <div>
          <span className="admin-eyebrow">Crowdsourced Quality</span>
          <h1 className="admin-page-title">Citizen Mistake Reports &amp; Feedback</h1>
          <p className="admin-subtext">Issues flagged by learners during interactive quizzes and lessons.</p>
        </div>
      </div>

      <div className="admin-table-container samvidhan-glow-card">
        <table className="admin-data-table">
          <thead>
            <tr>
              <th>Report Details</th>
              <th>Target Question</th>
              <th>Reported Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id}>
                <td>
                  <strong className="table-item-title">"{r.reason}"</strong>
                  {r.assignedTo && <span className="table-item-sub">Assigned: {r.assignedTo}</span>}
                </td>
                <td>
                  <span className="table-citation-badge">{r.prompt}</span>
                </td>
                <td>
                  <span className="table-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                </td>
                <td>
                  <span className={`status-pill status-${r.status.toLowerCase()}`}>
                    {r.status}
                  </span>
                </td>
                <td>
                  <div className="table-actions-row">
                    <button
                      type="button"
                      className="table-action-btn"
                      onClick={() => setActiveReport(r)}
                    >
                      <span>Resolve</span>
                    </button>
                    {r.status !== 'Fixed' && (
                      <button
                        type="button"
                        className="table-action-btn"
                        onClick={() => handleStatusChange(r.id, 'Fixed')}
                        title="Mark as Fixed"
                      >
                        <CheckCircle size={14} className="text-emerald" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reply Modal */}
      {activeReport && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="report-dialog-title">
          <div className="admin-modal samvidhan-glow-card">
            <h3 id="report-dialog-title">Resolve Citizen Report</h3>
            <p><strong>Citizen Flagged:</strong> "{activeReport.reason}"</p>
            <p><strong>Question:</strong> {activeReport.prompt}</p>

            <form onSubmit={handleReplySubmit}>
              <label htmlFor="reply-input" className="field-label">Resolution Note or Legal Revision:</label>
              <textarea
                id="reply-input"
                rows={4}
                required
                className="field-input"
                placeholder="e.g. Updated Article 14 explanation to clarify Royappa arbitrariness doctrine..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />

              <div className="admin-modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveReport(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Send size={15} />
                  <span>Send Resolution &amp; Mark Fixed</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
