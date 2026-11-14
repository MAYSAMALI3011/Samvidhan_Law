import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Sparkles,
  ArrowRight,
  Award,
  Bookmark,
  Check,
  CheckCircle,
  Moon,
  Save,
  ShieldAlert,
  Sun,
  Volume2,
  VolumeX,
  Target,
  Keyboard,
} from 'lucide-react'
import { LearningSidebar } from '../../components/navigation/LearningSidebar'
import { AnimatedBackButton } from '../../components/animations/AnimatedBackButton'
import { ToggleSwitch } from '../../components/animations/ToggleSwitch'
import { ExpandingLogoutButton } from '../../components/animations/ExpandingLogoutButton'
import { ThemeToggle } from '../../components/common/ThemeToggle'
import { EmptyStateView } from '../../ui/feedback/EmptyStateView'
import { BulkActionBar } from '../../ui/data/BulkActionBar'
import { shortcutItems } from '../../ui/navigation/shortcutsData'
import { useAppState } from '../../context/useAppState'
import { useTheme } from '../../context/useTheme'
import { getLesson, getQuiz } from '../../services/catalog'
import { usePageMeta } from '../../hooks/usePageMeta'
import { readJson, writeJson } from '../../utils/storage'
import { updateSettings } from '../../api/services/userService'

export function ProfilePage() {
  const { user, demoSignOut, pushToast } = useAppState()
  const navigate = useNavigate()

  usePageMeta({
    title: 'Learner Profile — Samvidhan',
    description: 'Manage your learner profile, active credentials, and study history.',
    path: '/profile',
  })

  const handleLogout = () => {
    demoSignOut()
    pushToast('You have been logged out.', 'info')
    navigate('/')
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'CL'

  return (
    <div className="container app-shell-layout">
      <LearningSidebar />
      <div className="app-shell-main">
        <AnimatedBackButton to="/dashboard" label="Back to Dashboard" />

        <header className="page-header-block">
          <span className="section-eyebrow">Learner Profile</span>
          <h1 className="page-title-main">Citizen Profile</h1>
        </header>

        <div className="banner warn" style={{ marginBottom: '1.75rem' }}>
          <ShieldAlert size={20} style={{ flexShrink: 0 }} aria-hidden="true" />
          <span>Local demo session. Preferences, quiz scores, and bookmarks remain preserved in this browser.</span>
        </div>

        <div className="panel profile-detail-panel">
          <div className="profile-detail-top">
            <div className="profile-avatar-large" aria-hidden="true">
              {initials}
            </div>
            <div>
              <h2 className="profile-detail-name">{user?.name || 'Citizen Learner'}</h2>
              <p className="profile-detail-email">{user?.email || 'citizen@example.in'}</p>
              <span className="profile-status-chip">Active Learner</span>
            </div>
          </div>

          <div className="profile-meta-grid">
            <div className="profile-meta-box">
              <span className="meta-box-label">Account Type</span>
              <span className="meta-box-val">Independent Citizen</span>
            </div>
            <div className="profile-meta-box">
              <span className="meta-box-label">Jurisdiction</span>
              <span className="meta-box-val">Republic of India</span>
            </div>
            <div className="profile-meta-box">
              <span className="meta-box-label">Curriculum Access</span>
              <span className="meta-box-val">Full &amp; Unrestricted</span>
            </div>
          </div>

          <div className="profile-actions-strip">
            <ExpandingLogoutButton onLogout={handleLogout} />
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProgressPage() {
  const { progress } = useAppState()

  usePageMeta({
    title: 'My Progress & Accreditations — Samvidhan',
    description: 'Track completed constitutional modules, quiz mastery scores, and streaks.',
    path: '/progress',
  })

  const completedLessons = (progress.completedLessonIds || []).map((id) => getLesson(id)).filter(Boolean)
  const quizEntries = Object.entries(progress.quizScores || {})

  return (
    <div className="container app-shell-layout">
      <LearningSidebar />
      <div className="app-shell-main">
        <AnimatedBackButton to="/dashboard" label="Back to Dashboard" />

        <header className="page-header-block">
          <span className="section-eyebrow">Learning Journey</span>
          <h1 className="page-title-main">My Progress &amp; Accreditations</h1>
        </header>

        {/* Stats Row */}
        <div className="profile-stats-row">
          <div className="panel profile-stat-box">
            <div className="stat-box-num">{progress.completedLessonIds?.length || 0}</div>
            <div className="stat-box-label">Lessons Mastered</div>
          </div>
          <div className="panel profile-stat-box">
            <div className="stat-box-num">{progress.xp ?? 0}</div>
            <div className="stat-box-label">Total XP Earned</div>
          </div>
          <div className="panel profile-stat-box">
            <div className="stat-box-num">🔥 {progress.streak ?? 0}</div>
            <div className="stat-box-label">Day Streak</div>
          </div>
        </div>

        {/* Completed Lessons */}
        <div className="panel" style={{ marginBottom: '2rem' }}>
          <h2 className="panel-subheading">Mastered Lessons ({completedLessons.length})</h2>
          {completedLessons.length > 0 ? (
            <div className="progress-lessons-grid">
              {completedLessons.map((l) => (
                <article key={l!.id} className="card progress-lesson-card">
                  <div className="progress-card-top">
                    <span className="badge">Verified Complete</span>
                    <CheckCircle size={16} style={{ color: 'var(--emerald)' }} aria-hidden="true" />
                  </div>
                  <h3 className="progress-card-title">{l!.title}</h3>
                  <p className="progress-card-desc">{l!.summary}</p>
                  <Link to={`/learn/${l!.courseId}/${l!.id}`} className="progress-card-link">
                    <span>Review Lesson</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state-card">
              <p className="empty-title">No completed lessons yet</p>
              <p className="empty-text">Start your first lesson in the curriculum to begin building your streak.</p>
              <Link to="/learn" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
                Browse Curriculum
              </Link>
            </div>
          )}
        </div>

        {/* Quiz Scores */}
        <div className="panel">
          <h2 className="panel-subheading">Statutory Quiz Scores ({quizEntries.length})</h2>
          {quizEntries.length > 0 ? (
            <div className="quiz-scores-list">
              {quizEntries.map(([quizId, score]) => {
                const quiz = getQuiz(quizId)
                return (
                  <div key={quizId} className="quiz-score-row">
                    <div>
                      <div className="quiz-row-title">{quiz?.title || quizId}</div>
                      <div className="quiz-row-meta">Official Assessment</div>
                    </div>
                    <div className="quiz-score-badge">
                      <Award size={16} aria-hidden="true" />
                      <span>{score}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-secondary">Take chapter quizzes to verify statutory comprehension and earn XP badges.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export function BookmarksPage() {
  const { progress, toggleBookmark, pushToast } = useAppState()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [lastIndex, setLastIndex] = useState<number | null>(null)

  usePageMeta({
    title: 'Bookmarked Lessons — Samvidhan',
    description: 'Quickly access saved articles, statutory provisions, and lesson notes.',
    path: '/bookmarks',
  })

  const bookmarkedLessons = (progress.bookmarks || []).map((id) => getLesson(id)).filter(Boolean)

  const handleSelectBookmark = (id: string, index: number, shiftKey: boolean) => {
    if (shiftKey && lastIndex !== null) {
      const start = Math.min(lastIndex, index)
      const end = Math.max(lastIndex, index)
      const rangeIds = bookmarkedLessons.slice(start, end + 1).map((l) => l!.id)
      setSelectedIds(Array.from(new Set([...selectedIds, ...rangeIds])))
    } else {
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter((item) => item !== id))
      } else {
        setSelectedIds([...selectedIds, id])
      }
      setLastIndex(index)
    }
  }

  const handleDeleteSelected = (ids: string[]) => {
    ids.forEach((id) => toggleBookmark(id))
    setSelectedIds([])
    pushToast(
      `${ids.length} bookmark${ids.length > 1 ? 's' : ''} removed`,
      'info',
      {
        label: 'Undo',
        onAction: () => {
          ids.forEach((id) => toggleBookmark(id))
          pushToast('Bookmarks restored', 'success')
        },
      },
      7000
    )
  }

  const handleExportSelected = (ids: string[]) => {
    const exportData = ids.map((id) => {
      const l = getLesson(id)
      return { id, title: l?.title, summary: l?.summary }
    })
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `samvidhan-bookmarks-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    pushToast(`Exported ${ids.length} bookmark(s)`, 'success')
  }

  return (
    <div className="container app-shell-layout">
      <LearningSidebar />
      <div className="app-shell-main">
        <AnimatedBackButton to="/dashboard" label="Back to Dashboard" />

        <header className="page-header-block">
          <span className="section-eyebrow">Quick Reference</span>
          <h1 className="page-title-main">Bookmarked Lessons ({bookmarkedLessons.length})</h1>
        </header>

        {bookmarkedLessons.length > 0 ? (
          <div className="progress-lessons-grid">
            {bookmarkedLessons.map((l, idx) => {
              const isSelected = selectedIds.includes(l!.id)
              return (
                <article
                  key={l!.id}
                  className={`card progress-lesson-card ${isSelected ? 'is-selected-card' : ''}`}
                  style={{
                    border: isSelected ? '1.5px solid var(--gold)' : undefined,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div className="progress-card-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) =>
                          handleSelectBookmark(l!.id, idx, (e.nativeEvent as MouseEvent).shiftKey)
                        }
                        aria-label={`Select ${l!.title}`}
                      />
                      <span className="badge">Saved Article</span>
                    </div>
                    <Bookmark size={16} style={{ color: 'var(--gold)' }} fill="currentColor" aria-hidden="true" />
                  </div>
                  <h3 className="progress-card-title">{l!.title}</h3>
                  <p className="progress-card-desc">{l!.summary}</p>
                  <Link to={`/learn/${l!.courseId}/${l!.id}`} className="progress-card-link">
                    <span>Open Lesson</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </article>
              )
            })}
          </div>
        ) : (
          <EmptyStateView
            title="Nothing saved yet"
            description="Bookmark an article to find it here whenever you need a quick statutory refresher."
            mascotMood="idle"
            action={{
              label: 'Browse Lessons',
              to: '/learn',
            }}
            suggestions={[
              { label: 'Preamble Foundations', to: '/learn' },
              { label: 'Fundamental Rights', to: '/constitution' },
              { label: 'Legal Procedures', to: '/library' },
            ]}
          />
        )}

        {/* Pattern 10: Bulk Action Bar with Undo Toast */}
        <BulkActionBar
          selectedIds={selectedIds}
          totalCount={bookmarkedLessons.length}
          onClearSelection={() => setSelectedIds([])}
          onSelectAll={() => setSelectedIds(bookmarkedLessons.map((l) => l!.id))}
          onDeleteSelected={handleDeleteSelected}
          onExportSelected={handleExportSelected}
        />
      </div>
    </div>
  )
}

export function SavedPage() {
  return <BookmarksPage />
}

export function SettingsPage() {
  const { activeTheme } = useTheme()
  const { progress, toggleSound, toggleMascot, setDailyGoal, pushToast } = useAppState()
  const [reduceMotion, setReduceMotion] = useState(() => readJson('pref:motion', false))
  const [compact, setCompact] = useState(() => readJson('pref:compact', false))
  const [savedSuccess, setSavedSuccess] = useState(false)

  usePageMeta({
    title: 'Settings & Appearance — Samvidhan',
    description: 'Customize reading preferences, audio chimes, theme mode, and accessibility controls.',
    path: '/settings',
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    writeJson('pref:motion', reduceMotion)
    writeJson('pref:compact', compact)

    if (reduceMotion) {
      document.documentElement.classList.add('reduced-motion')
    } else {
      document.documentElement.classList.remove('reduced-motion')
    }

    try {
      await updateSettings({
        reduceMotion,
        compact,
        dailyGoal: progress.dailyGoal,
        soundEnabled: progress.soundEnabled,
        mascotEnabled: progress.mascotEnabled,
      })
    } catch {
      // non-blocking
    }

    setSavedSuccess(true)
    pushToast('Preferences saved successfully.', 'success')
    setTimeout(() => setSavedSuccess(false), 2400)
  }

  return (
    <div className="container app-shell-layout">
      <LearningSidebar />
      <div className="app-shell-main">
        <AnimatedBackButton to="/dashboard" label="Back to Dashboard" />

        <header className="page-header-block">
          <span className="section-eyebrow">Configuration</span>
          <h1 className="page-title-main">Settings &amp; Appearance</h1>
          <p className="section-desc-left">
            Customize your constitutional reading experience, audio feedback, display themes, and learning goals.
          </p>
        </header>

        <form onSubmit={handleSave} className="panel settings-form-panel samvidhan-glow-card">
          {/* 1. Theme Mode: Uiverse-Style Switch (Light / Dark) + Follow System Theme */}
          <div className="settings-row-item">
            <div className="settings-text-meta">
              <strong className="settings-item-title">
                {activeTheme === 'dark' ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
                Appearance &amp; Theme
              </strong>
              <p className="settings-item-desc">
                Toggle between Imperial Daylight and Sovereign Night, or let the app follow your operating system automatically.
              </p>
            </div>

            <ThemeToggle showSystemToggle={true} idPrefix="settings-theme" />
          </div>

          <div className="settings-divider" />

          {/* 2. Guide Character Toggle */}
          <div className="settings-row-item">
            <div className="settings-text-meta">
              <strong className="settings-item-title">
                <Sparkles size={18} className="text-gold" aria-hidden="true" />
                Show guide character
              </strong>
              <p className="settings-item-desc">
                Show Mor the Peacock, your friendly constitutional guide, in lessons, habit trackers, and milestone celebrations.
              </p>
            </div>
            <ToggleSwitch
              checked={progress.mascotEnabled !== false}
              onChange={toggleMascot}
              ariaLabel="Toggle Mor the peacock guide character"
            />
          </div>

          <div className="settings-divider" />

          {/* 3. Audio Chimes & Sound Effects */}
          <div className="settings-row-item">
            <div className="settings-text-meta">
              <strong className="settings-item-title">
                {progress.soundEnabled ? <Volume2 size={18} aria-hidden="true" /> : <VolumeX size={18} aria-hidden="true" />}
                Gamified Audio Effects
              </strong>
              <p className="settings-item-desc">
                Plays celebratory chimes on correct answers and gentle thuds on mistakes (synthesized Web Audio, zero delay).
              </p>
            </div>
            <ToggleSwitch
              checked={progress.soundEnabled}
              onChange={toggleSound}
              ariaLabel="Toggle sound effects"
            />
          </div>

          <div className="settings-divider" />

          {/* 4. Daily Learning XP Goal */}
          <div className="settings-row-item">
            <div className="settings-text-meta">
              <strong className="settings-item-title">
                <Target size={18} aria-hidden="true" />
                Daily XP Target
              </strong>
              <p className="settings-item-desc">
                Set how much daily practice you aim for. Lessons award 15 XP, chapter quizzes award 25 XP.
              </p>
            </div>
            <div className="daily-goal-selector" role="radiogroup" aria-label="Daily XP Target">
              {[15, 30, 50].map((goal) => (
                <button
                  key={goal}
                  type="button"
                  role="radio"
                  aria-checked={progress.dailyGoal === goal}
                  className={`goal-btn ${progress.dailyGoal === goal ? 'is-active' : ''}`}
                  onClick={() => setDailyGoal(goal)}
                >
                  <strong>{goal} XP</strong>
                  <span>{goal === 15 ? 'Casual' : goal === 30 ? 'Regular' : 'Dedicated'}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="settings-divider" />

          {/* 5. Reduced Motion Toggle */}
          <div className="settings-row-item">
            <div className="settings-text-meta">
              <strong className="settings-item-title">Respect Reduced Motion</strong>
              <p className="settings-item-desc">
                Disables ambient page movements, gradient drifts, and floating card lifts for users sensitive to motion.
              </p>
            </div>
            <ToggleSwitch
              checked={reduceMotion}
              onChange={(val) => setReduceMotion(val)}
              ariaLabel="Respect reduced motion"
            />
          </div>

          <div className="settings-divider" />

          {/* 6. Compact Reading Layout */}
          <div className="settings-row-item">
            <div className="settings-text-meta">
              <strong className="settings-item-title">Compact Reading View</strong>
              <p className="settings-item-desc">
                Reduces line-height and card margins for higher information density during intense research.
              </p>
            </div>
            <ToggleSwitch
              checked={compact}
              onChange={(val) => setCompact(val)}
              ariaLabel="Compact reading layout"
            />
          </div>

          <div className="settings-footer-actions">
            <button
              type="submit"
              className={`btn btn-primary settings-save-btn ${savedSuccess ? 'is-saved' : ''}`}
            >
              {savedSuccess ? (
                <>
                  <Check size={16} aria-hidden="true" />
                  <span>Preferences Saved</span>
                </>
              ) : (
                <>
                  <Save size={16} aria-hidden="true" />
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Pattern 13: Keyboard Shortcuts Reference Card */}
        <div className="panel samvidhan-glow-card" style={{ marginTop: '2rem', padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
            <Keyboard size={20} className="text-gold" aria-hidden="true" />
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-serif)' }}>
              Keyboard Shortcuts Cheat Sheet
            </h2>
          </div>
          <p className="muted" style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Use these shortcuts anywhere on Samvidhan for rapid power navigation without lifting your hands from the keyboard.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
            {shortcutItems.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  fontSize: '0.86rem',
                }}
              >
                <span>{item.description}</span>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {item.keys.map((k, kIdx) => (
                    <span key={kIdx} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <kbd className="shortcut-kbd">{k}</kbd>
                      {kIdx < item.keys.length - 1 && <span style={{ fontSize: '0.7rem', color: '#64748b' }}>+</span>}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
