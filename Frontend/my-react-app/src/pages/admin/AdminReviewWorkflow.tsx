import { useState } from 'react'
import { CheckCircle2, ShieldCheck, Check, XCircle } from 'lucide-react'
import { adminService, type AdminContentItem } from '../../services/adminService'
import { useAdminContext } from './AdminLayout'

export function AdminReviewWorkflow() {
  const [items, setItems] = useState<AdminContentItem[]>(() => adminService.getContentItems())
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const { demoRole } = useAdminContext()
  const canApprove = ['superadmin', 'admin', 'reviewer'].includes(demoRole)

  const handleStatusChange = (id: string, status: AdminContentItem['status']) => {
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      adminService.updateContentStatus(id, status)
      setItems(adminService.getContentItems())
      setSuccessMsg(`Item status updated to ${status}!`)
      setTimeout(() => setSuccessMsg(null), 3500)
    } catch (err: any) {
      setErrorMsg(err.message)
    }
  }

  const columns: { status: AdminContentItem['status']; label: string; desc: string }[] = [
    { status: 'Draft', label: 'Drafts', desc: 'Authored lessons being drafted by editors.' },
    { status: 'In Review', label: 'Review Queue', desc: 'Awaiting constitutional legal verification.' },
    { status: 'Approved', label: 'Approved', desc: 'Legally certified. Ready for release.' },
    { status: 'Published', label: 'Live on Samvidhan', desc: 'Available to learners in the curriculum.' },
  ]

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <span className="admin-eyebrow">Legal Accuracy &amp; Governance</span>
          <h1 className="admin-page-title">Statutory Review Pipeline</h1>
          <p className="admin-subtext">
            Every legal lesson must cite an authentic Article or Act before a Reviewer can approve it.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="admin-error-banner" role="alert">
          <XCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="admin-toast-banner" role="alert">
          <Check size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Kanban / Pipeline View */}
      <div className="workflow-columns-grid">
        {columns.map((col) => {
          const colItems = items.filter((i) => i.status === col.status)

          return (
            <div key={col.status} className="workflow-column samvidhan-glow-card">
              <div className="workflow-col-header">
                <div className="col-header-meta">
                  <h3 className="col-title">{col.label}</h3>
                  <span className="col-count-badge">{colItems.length}</span>
                </div>
                <p className="col-desc">{col.desc}</p>
              </div>

              <div className="workflow-cards-list">
                {colItems.map((item) => (
                  <div key={item.id} className="workflow-card">
                    <span className="wf-card-unit">UNIT {item.unitId}</span>
                    <strong className="wf-card-title">{item.title}</strong>
                    <div className="wf-card-citation">
                      <ShieldCheck size={13} className="text-gold" />
                      <span>{item.citation || 'Missing Statutory Citation!'}</span>
                    </div>

                    <div className="wf-card-footer">
                      <span className="wf-author">{item.author}</span>

                      {/* Action buttons based on status */}
                      <div className="wf-actions">
                        {item.status === 'Draft' && (
                          <button
                            type="button"
                            className="btn btn-sm btn-ghost"
                            onClick={() => handleStatusChange(item.id, 'In Review')}
                          >
                            Submit Review &rarr;
                          </button>
                        )}

                        {item.status === 'In Review' && canApprove && (
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={() => handleStatusChange(item.id, 'Approved')}
                          >
                            <CheckCircle2 size={13} />
                            <span>Approve</span>
                          </button>
                        )}

                        {item.status === 'Approved' && (
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={() => handleStatusChange(item.id, 'Published')}
                          >
                            Publish Live &rarr;
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
