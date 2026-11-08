import { Link } from 'react-router-dom'
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Award,
} from 'lucide-react'
import { adminService } from '../../services/adminService'

export function AdminDashboard() {
  const users = adminService.getUsers()
  const content = adminService.getContentItems()
  const reports = adminService.getReports()

  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.status === 'Active').length
  const publishedCount = content.filter((c) => c.status === 'Published').length
  const needsReviewCount = content.filter((c) => c.status === 'In Review').length
  const openReports = reports.filter((r) => r.status === 'New' || r.status === 'Investigating').length

  // Realistic sample activity points for SVG Chart
  const activityData = [
    { day: 'Mon', count: 42 },
    { day: 'Tue', count: 58 },
    { day: 'Wed', count: 65 },
    { day: 'Thu', count: 54 },
    { day: 'Fri', count: 80 },
    { day: 'Sat', count: 96 },
    { day: 'Sun', count: 110 },
  ]
  const maxVal = Math.max(...activityData.map((d) => d.count))

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <span className="admin-eyebrow">Realtime Platform Health</span>
          <h1 className="admin-page-title">Curriculum Operations & Analytics</h1>
        </div>
        <div className="admin-head-action">
          <Link to="/admin/review" className="btn btn-primary btn-sm">
            <span>Review Queue ({needsReviewCount})</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card samvidhan-glow-card">
          <div className="kpi-icon-wrap text-gold">
            <Users size={22} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">Active Learners</span>
            <div className="kpi-num">{activeUsers} <span className="kpi-total">/ {totalUsers} total</span></div>
          </div>
        </div>

        <div className="admin-kpi-card samvidhan-glow-card">
          <div className="kpi-icon-wrap text-emerald">
            <CheckCircle2 size={22} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">Published Lessons</span>
            <div className="kpi-num">{publishedCount} <span className="kpi-total">verified</span></div>
          </div>
        </div>

        <div className="admin-kpi-card samvidhan-glow-card">
          <div className="kpi-icon-wrap text-blue">
            <Award size={22} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">Avg Quiz Accuracy</span>
            <div className="kpi-num">82.4%</div>
          </div>
        </div>

        <div className="admin-kpi-card samvidhan-glow-card">
          <div className="kpi-icon-wrap text-coral">
            <AlertTriangle size={22} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">Open Mistake Reports</span>
            <div className="kpi-num">{openReports}</div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="admin-charts-grid">
        {/* 7-Day Learner Activity Area Chart */}
        <div className="admin-chart-card samvidhan-glow-card">
          <div className="chart-card-head">
            <h3 className="chart-title">7-Day Learning Activity (Lessons Finished)</h3>
            <span className="chart-badge">+28% this week</span>
          </div>

          <div className="svg-chart-wrapper">
            <svg viewBox="0 0 500 160" className="chart-svg" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#DFBA73" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#DFBA73" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area fill */}
              <polygon
                points={
                  activityData.map((d, i) => `${i * 80 + 10},${140 - (d.count / maxVal) * 110}`).join(' ') +
                  ` 490,140 10,140`
                }
                fill="url(#chartGrad)"
              />

              {/* Line */}
              <polyline
                fill="none"
                stroke="#DFBA73"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={activityData.map((d, i) => `${i * 80 + 10},${140 - (d.count / maxVal) * 110}`).join(' ')}
              />

              {/* Data points */}
              {activityData.map((d, i) => (
                <circle
                  key={d.day}
                  cx={i * 80 + 10}
                  cy={140 - (d.count / maxVal) * 110}
                  r="5"
                  fill="#0A1628"
                  stroke="#DFBA73"
                  strokeWidth="2.5"
                />
              ))}
            </svg>

            {/* X-Axis labels */}
            <div className="chart-labels-row">
              {activityData.map((d) => (
                <span key={d.day} className="chart-day-label">
                  {d.day} ({d.count})
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Completion by Unit */}
        <div className="admin-chart-card samvidhan-glow-card">
          <div className="chart-card-head">
            <h3 className="chart-title">Curriculum Unit Engagement</h3>
          </div>

          <div className="unit-bars-list">
            {[
              { name: 'Unit 1: The Preamble & Sovereign Foundations', pct: 92, count: '142 learners' },
              { name: 'Unit 2: Fundamental Rights in Practice', pct: 78, count: '110 learners' },
              { name: 'Unit 3: Everyday Citizen Protections (RTI, FIR)', pct: 64, count: '85 learners' },
            ].map((u) => (
              <div key={u.name} className="unit-bar-item">
                <div className="unit-bar-meta">
                  <strong className="unit-bar-title">{u.name}</strong>
                  <span className="unit-bar-count">{u.count}</span>
                </div>
                <div className="unit-progress-track">
                  <div className="unit-progress-fill" style={{ width: `${u.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hardest Questions & Recent Reports */}
      <div className="admin-split-grid">
        {/* Hardest Questions */}
        <div className="admin-subpanel samvidhan-glow-card">
          <h3 className="subpanel-title">Most Challenging Statutory Questions</h3>
          <p className="subpanel-desc">Questions with lowest first-attempt pass rates requiring pedagogical review:</p>

          <div className="hard-questions-list">
            {[
              {
                prompt: 'Under Article 14, does "any person" protect only citizens or non-citizens?',
                passRate: '54%',
                article: 'Article 14',
              },
              {
                prompt: 'Can police detain a citizen indefinitely without an arrest memo under D.K. Basu?',
                passRate: '62%',
                article: 'Sec 41B CrPC',
              },
              {
                prompt: 'Did Kesavananda Bharati allow altering the Preamble with 2/3rd majority?',
                passRate: '68%',
                article: 'Article 368',
              },
            ].map((q, idx) => (
              <div key={idx} className="hard-question-row">
                <div className="hard-q-left">
                  <span className="hard-q-badge">{q.article}</span>
                  <p className="hard-q-prompt">{q.prompt}</p>
                </div>
                <div className="hard-q-rate">
                  <span>Pass: {q.passRate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Mistake Reports Inbox */}
        <div className="admin-subpanel samvidhan-glow-card">
          <div className="subpanel-head-flex">
            <h3 className="subpanel-title">Recent Citizen Reports</h3>
            <Link to="/admin/reports" className="view-all-link">View All ({reports.length})</Link>
          </div>

          <div className="reports-mini-list">
            {reports.slice(0, 3).map((r) => (
              <div key={r.id} className="report-mini-item">
                <div className="report-mini-top">
                  <span className={`report-status-badge status-${r.status.toLowerCase()}`}>{r.status}</span>
                  <span className="report-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="report-mini-reason">"{r.reason}"</p>
                <span className="report-mini-target">Target: {r.prompt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
