import type { UserRole, QuestionType } from '../types'

export interface AdminContentItem {
  id: string
  unitId: number
  title: string
  type: 'unit' | 'lesson' | 'quiz_question'
  status: 'Draft' | 'In Review' | 'Approved' | 'Published' | 'Archived'
  citation: string
  author: string
  updatedAt: string
  contentPreview: string
  questionType?: QuestionType
}

export interface AdminUserRecord {
  id: string
  name: string
  email: string
  role: UserRole
  xp: number
  streak: number
  completedLessons: number
  status: 'Active' | 'Suspended'
  createdAt: string
}

export interface MistakeReport {
  id: string
  questionId: string
  prompt: string
  reason: string
  createdAt: string
  status: 'New' | 'Investigating' | 'Fixed' | 'Rejected'
  assignedTo?: string
}

export interface AuditLogItem {
  id: string
  actor: string
  action: string
  target: string
  timestamp: string
  details: string
}

// Initial mock data seed
const initialContentItems: AdminContentItem[] = [
  {
    id: 'lesson-preamble-1',
    unitId: 1,
    title: 'We, The People: The Source of Power',
    type: 'lesson',
    status: 'Published',
    citation: 'Preamble, Constitution of India (1950)',
    author: 'Chief Legal Editor',
    updatedAt: '2026-11-05',
    contentPreview: 'Sovereignty rests with citizens. Rule of law protects against arbitrary state overreach.',
  },
  {
    id: 'lesson-basic-structure-2',
    unitId: 1,
    title: 'Basic Structure: Can Parliament Change Anything?',
    type: 'lesson',
    status: 'Published',
    citation: 'Article 368 & Kesavananda Bharati (1973) 4 SCC 225',
    author: 'Constitutional Researcher',
    updatedAt: '2026-11-05',
    contentPreview: 'The Supreme Court held that amending power is not unlimited.',
  },
  {
    id: 'lesson-article-14-3',
    unitId: 2,
    title: 'Article 14: Equality Before Law',
    type: 'lesson',
    status: 'In Review',
    citation: 'Article 14 & Royappa Doctrine (1974)',
    author: 'Junior Editor',
    updatedAt: '2026-11-04',
    contentPreview: 'Equality strikes at arbitrariness. State cannot create irrational classifications.',
  },
  {
    id: 'draft-directive-principles-4',
    unitId: 3,
    title: 'Directive Principles & Uniform Civil Code',
    type: 'lesson',
    status: 'Draft',
    citation: 'Article 44, Part IV',
    author: 'Legal Research Fellow',
    updatedAt: '2026-11-03',
    contentPreview: 'Non-justiciable fundamental guidelines for state policy formulation.',
  },
]

const initialUsers: AdminUserRecord[] = [
  {
    id: 'usr-1',
    name: 'Advocate Priya Sharma',
    email: 'priya.legal@samvidhan.in',
    role: 'superadmin',
    xp: 450,
    streak: 14,
    completedLessons: 12,
    status: 'Active',
    createdAt: '2026-10-12',
  },
  {
    id: 'usr-2',
    name: 'Vikram Joshi (Reviewer)',
    email: 'vikram.reviewer@samvidhan.in',
    role: 'reviewer',
    xp: 320,
    streak: 8,
    completedLessons: 9,
    status: 'Active',
    createdAt: '2026-10-18',
  },
  {
    id: 'usr-3',
    name: 'Aisha Khan (Editor)',
    email: 'aisha.editor@samvidhan.in',
    role: 'editor',
    xp: 290,
    streak: 6,
    completedLessons: 7,
    status: 'Active',
    createdAt: '2026-10-25',
  },
  {
    id: 'usr-4',
    name: 'Rahul Deshmukh',
    email: 'rahul.citizen@example.in',
    role: 'learner',
    xp: 125,
    streak: 3,
    completedLessons: 4,
    status: 'Active',
    createdAt: '2026-11-01',
  },
]

const initialReports: MistakeReport[] = [
  {
    id: 'rep-1',
    questionId: 'q1-1',
    prompt: 'Where does ultimate sovereign power reside?',
    reason: 'Clarify whether "We the People" refers to the Constituent Assembly or continuing citizenry.',
    createdAt: '2026-11-04T14:20:00Z',
    status: 'Investigating',
    assignedTo: 'Vikram Joshi (Reviewer)',
  },
  {
    id: 'rep-2',
    questionId: 'q1-2',
    prompt: 'Article 300A Right to Property',
    reason: 'Typo in 44th Constitutional Amendment Year citation.',
    createdAt: '2026-11-05T09:15:00Z',
    status: 'New',
  },
]

const initialAuditLogs: AuditLogItem[] = [
  {
    id: 'aud-1',
    actor: 'Priya Sharma (superadmin)',
    action: 'PUBLISH_CONTENT',
    target: 'lesson-preamble-1',
    timestamp: '2026-11-05 18:30:00',
    details: 'Verified statutory citation for CAD Vol XI and approved for production.',
  },
  {
    id: 'aud-2',
    actor: 'Vikram Joshi (reviewer)',
    action: 'APPROVAL_REQUEST',
    target: 'lesson-article-14-3',
    timestamp: '2026-11-04 11:22:00',
    details: 'Verified citation compliance with Royappa 1974 doctrine.',
  },
]

// Storage helpers
function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`samvidhan-admin:${key}`)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function setStored<T>(key: string, data: T) {
  try {
    localStorage.setItem(`samvidhan-admin:${key}`, JSON.stringify(data))
  } catch {}
}

export const adminService = {
  // Content Items
  getContentItems(): AdminContentItem[] {
    return getStored<AdminContentItem[]>('content-items', initialContentItems)
  },
  saveContentItem(item: AdminContentItem) {
    const items = this.getContentItems()
    const idx = items.findIndex((i) => i.id === item.id)
    if (idx >= 0) {
      items[idx] = item
    } else {
      items.unshift(item)
    }
    setStored('content-items', items)
    this.addAuditLog('SAVE_CONTENT', item.id, `Saved item "${item.title}" with status ${item.status}`)
  },
  deleteContentItem(id: string) {
    const items = this.getContentItems().filter((i) => i.id !== id)
    setStored('content-items', items)
    this.addAuditLog('DELETE_CONTENT', id, 'Deleted content item from store')
  },

  // Review Workflow
  updateContentStatus(id: string, nextStatus: AdminContentItem['status']) {
    const items = this.getContentItems()
    const item = items.find((i) => i.id === id)
    if (!item) return

    // Strict citation rule: Cannot approve or publish without citation!
    if ((nextStatus === 'Approved' || nextStatus === 'Published') && (!item.citation || item.citation.trim().length < 4)) {
      throw new Error('Mandatory legal check failed: A verified Article, Act, or landmark case citation is required before approval!')
    }

    item.status = nextStatus
    item.updatedAt = new Date().toISOString().split('T')[0]
    setStored('content-items', items)
    this.addAuditLog('STATUS_CHANGE', id, `Updated status to ${nextStatus}`)
  },

  // Users
  getUsers(): AdminUserRecord[] {
    return getStored<AdminUserRecord[]>('users', initialUsers)
  },
  updateUserRole(userId: string, role: UserRole) {
    const users = this.getUsers()
    const u = users.find((usr) => usr.id === userId)
    if (u) {
      u.role = role
      setStored('users', users)
      this.addAuditLog('UPDATE_USER_ROLE', userId, `Changed role to ${role}`)
    }
  },
  resetUserProgress(userId: string) {
    const users = this.getUsers()
    const u = users.find((usr) => usr.id === userId)
    if (u) {
      u.xp = 0
      u.streak = 1
      u.completedLessons = 0
      setStored('users', users)
      this.addAuditLog('RESET_PROGRESS', userId, 'Reset user XP, streak, and completed lessons')
    }
  },
  toggleUserStatus(userId: string) {
    const users = this.getUsers()
    const u = users.find((usr) => usr.id === userId)
    if (u) {
      u.status = u.status === 'Active' ? 'Suspended' : 'Active'
      setStored('users', users)
      this.addAuditLog('TOGGLE_USER_STATUS', userId, `User status set to ${u.status}`)
    }
  },

  // Mistake Reports
  getReports(): MistakeReport[] {
    const local = JSON.parse(localStorage.getItem('samvidhan-mistake-reports') || '[]')
    const combined = [...getStored<MistakeReport[]>('reports', initialReports), ...local]
    // deduplicate by id
    const seen = new Set()
    return combined.filter((r) => {
      if (seen.has(r.id)) return false
      seen.add(r.id)
      return true
    })
  },
  updateReportStatus(id: string, status: MistakeReport['status'], assignedTo?: string) {
    const reports = this.getReports()
    const r = reports.find((item) => item.id === id)
    if (r) {
      r.status = status
      if (assignedTo) r.assignedTo = assignedTo
      setStored('reports', reports)
      this.addAuditLog('UPDATE_REPORT', id, `Report marked as ${status}`)
    }
  },

  // Audit Logs
  getAuditLogs(): AuditLogItem[] {
    return getStored<AuditLogItem[]>('audit-logs', initialAuditLogs)
  },
  addAuditLog(action: string, target: string, details: string) {
    const logs = this.getAuditLogs()
    const newLog: AuditLogItem = {
      id: Math.random().toString(36).slice(2, 9),
      actor: 'Admin Session (Demo)',
      action,
      target,
      timestamp: new Date().toLocaleString(),
      details,
    }
    setStored('audit-logs', [newLog, ...logs].slice(0, 100))
  },

  // Feature Flags & Settings
  getFeatureFlags() {
    return getStored('feature-flags', {
      mascotEnabled: true,
      audioEffects: true,
      leaderboards: true,
      dailyPractice: true,
      citationEnforcement: true,
    })
  },
  updateFeatureFlags(flags: Record<string, boolean>) {
    setStored('feature-flags', flags)
    this.addAuditLog('UPDATE_FEATURE_FLAGS', 'System', 'Updated platform feature flags')
  },
}
