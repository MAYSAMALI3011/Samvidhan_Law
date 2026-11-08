import { useState } from 'react'
import { ShieldCheck, Search, Activity, Server } from 'lucide-react'
import { adminService, type AuditLogItem } from '../../services/adminService'

export function AdminAudit() {
  const [logs] = useState<AuditLogItem[]>(() => adminService.getAuditLogs())
  const [search, setSearch] = useState('')

  const filteredLogs = logs.filter((l) =>
    l.actor.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.target.toLowerCase().includes(search.toLowerCase()) ||
    l.details.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <span className="admin-eyebrow">Security &amp; Compliance</span>
          <h1 className="admin-page-title">Audit Trail &amp; System Health</h1>
          <p className="admin-subtext">Immutable log of administrative actions, approvals, and content modifications.</p>
        </div>
      </div>

      {/* System Health Indicators */}
      <div className="admin-kpi-grid" style={{ marginBottom: '2rem' }}>
        <div className="admin-kpi-card samvidhan-glow-card">
          <div className="kpi-icon-wrap text-emerald">
            <Server size={20} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">API Gateway</span>
            <div className="kpi-num">Operational (100%)</div>
          </div>
        </div>

        <div className="admin-kpi-card samvidhan-glow-card">
          <div className="kpi-icon-wrap text-gold">
            <ShieldCheck size={20} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">RBAC Security Layer</span>
            <div className="kpi-num">Enforced</div>
          </div>
        </div>

        <div className="admin-kpi-card samvidhan-glow-card">
          <div className="kpi-icon-wrap text-blue">
            <Activity size={20} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">Total Logged Events</span>
            <div className="kpi-num">{logs.length}</div>
          </div>
        </div>
      </div>

      <div className="admin-filter-bar samvidhan-glow-card">
        <div className="admin-search-wrap">
          <Search size={16} className="search-icon text-gold" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search audit trail by actor, action, or target..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-table-container samvidhan-glow-card">
        <table className="admin-data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Target</th>
              <th>Event Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((l) => (
              <tr key={l.id}>
                <td>
                  <span className="table-date">{l.timestamp}</span>
                </td>
                <td>
                  <strong className="table-item-title">{l.actor}</strong>
                </td>
                <td>
                  <span className="audit-action-pill">{l.action}</span>
                </td>
                <td>
                  <span className="table-citation-badge">{l.target}</span>
                </td>
                <td>
                  <span className="audit-details-text">{l.details}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
