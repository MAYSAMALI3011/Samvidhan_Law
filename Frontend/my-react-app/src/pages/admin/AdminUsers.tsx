import { useState } from 'react'
import { Search, RotateCcw, Download, Check } from 'lucide-react'
import { adminService, type AdminUserRecord } from '../../services/adminService'
import type { UserRole } from '../../types'

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUserRecord[]>(() => adminService.getUsers())
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  )

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    adminService.updateUserRole(userId, newRole)
    setUsers(adminService.getUsers())
    showToast(`User role updated to ${newRole}`)
  }

  const handleResetProgress = (userId: string, userName: string) => {
    if (!confirm(`Reset learning progress (XP, streaks, lessons) for ${userName}?`)) return
    adminService.resetUserProgress(userId)
    setUsers(adminService.getUsers())
    showToast(`Progress reset for ${userName}`)
  }

  const handleToggleStatus = (userId: string) => {
    adminService.toggleUserStatus(userId)
    setUsers(adminService.getUsers())
    showToast('User account status updated')
  }

  const handleExportUsers = () => {
    const csv = 'Name,Email,Role,XP,Streak,CompletedLessons,Status\n' +
      users.map((u) => `"${u.name}","${u.email}","${u.role}",${u.xp},${u.streak},${u.completedLessons},"${u.status}"`).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'samvidhan-users-export.csv'
    a.click()
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
          <span className="admin-eyebrow">Identity &amp; Access</span>
          <h1 className="admin-page-title">Citizen Users &amp; Roles</h1>
        </div>

        <div className="admin-head-action">
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleExportUsers}>
            <Download size={14} />
            <span>Export User Directory (CSV)</span>
          </button>
        </div>
      </div>

      <div className="admin-filter-bar samvidhan-glow-card">
        <div className="admin-search-wrap">
          <Search size={16} className="search-icon text-gold" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by citizen name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-table-container samvidhan-glow-card">
        <table className="admin-data-table">
          <thead>
            <tr>
              <th>Learner</th>
              <th>System Role</th>
              <th>Learning Progress</th>
              <th>Account Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id}>
                <td>
                  <strong className="table-item-title">{u.name}</strong>
                  <span className="table-item-sub">{u.email}</span>
                </td>
                <td>
                  <select
                    className="role-dropdown-select"
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                  >
                    <option value="user">User (Citizen)</option>
                    <option value="editor">Editor</option>
                    <option value="reviewer">Reviewer</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </td>
                <td>
                  <div className="user-progress-pills">
                    <span className="user-xp-badge">? {u.xp} XP</span>
                    <span className="user-streak-badge">?? {u.streak}d</span>
                    <span className="user-lessons-badge">?? {u.completedLessons}</span>
                  </div>
                </td>
                <td>
                  <button
                    type="button"
                    className={`status-pill status-${u.status.toLowerCase()}`}
                    onClick={() => handleToggleStatus(u.id)}
                    title="Click to toggle Active/Suspended"
                  >
                    {u.status}
                  </button>
                </td>
                <td>
                  <div className="table-actions-row">
                    <button
                      type="button"
                      className="table-action-btn"
                      onClick={() => handleResetProgress(u.id, u.name)}
                      title="Reset progress"
                    >
                      <RotateCcw size={14} />
                      <span>Reset</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
