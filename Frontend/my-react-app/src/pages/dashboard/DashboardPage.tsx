import { useSearchParams, Link } from 'react-router-dom'
import {
  Flame,
  Zap,
  Award,
  PlayCircle,
  Compass,
  ArrowRight,
  Target,
  CheckCircle2,
  Landmark,
  Library,
  Users,
} from 'lucide-react'
import { useAppState } from '../../context/useAppState'
import { usePageMeta } from '../../hooks/usePageMeta'
import { LearningSidebar } from '../../components/navigation/LearningSidebar'
import { LearningPath } from '../../components/learning/LearningPath'
import { DailyPracticeWidget } from '../../components/learning/DailyPracticeWidget'
import { BadgeShelf } from '../../components/learning/BadgeShelf'
import { CourseCard } from '../../components/learning/CourseCard'
import { DashboardConstitutionView } from '../../components/dashboard/DashboardConstitutionView'
import { DashboardLibraryView } from '../../components/dashboard/DashboardLibraryView'
import { courses } from '../../data/mock/curriculum'
import { continueLesson } from '../../services/catalog'

export function DashboardPage() {
  const { user, progress } = useAppState()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = (searchParams.get('tab') as 'path' | 'courses' | 'constitution' | 'library') || 'path'

  usePageMeta({
    title: 'Dashboard — Citizen Learning Hub',
    description: 'Track your constitutional comprehension, check your scores and streak, and continue your civic lessons.',
    path: '/dashboard',
  })

  const next = continueLesson(progress.completedLessonIds)
  const completedCount = progress.completedLessonIds?.length || 0
  const streakDays = progress.streak ?? 0
  const totalXp = progress.xp ?? 0
  const dailyTarget = progress.dailyGoal && progress.dailyGoal > 0 ? progress.dailyGoal : 3
  const todayProgress = Math.min(completedCount, dailyTarget)
  const quizScores = Object.values(progress.quizScores || {})
  const accuracy = quizScores.length > 0
    ? Math.round(quizScores.reduce((sum, s) => sum + s, 0) / quizScores.length)
    : 0
  const firstName = user?.name ? user.name.split(' ')[0] : 'Citizen'

  return (
    <div className="container app-shell-layout">
      {/* 260px Collapsible App Sidebar (Sticky, Left Column) */}
      <LearningSidebar />

      {/* Main Dashboard Hub Area (Flexible, Right Column) */}
      <main className="app-shell-main" role="main">
        {/* Breadcrumb Row */}
        <nav className="dashboard-breadcrumb" aria-label="Breadcrumb">
          <span>Portal</span>
          <span className="breadcrumb-separator" aria-hidden="true">/</span>
          <span className="breadcrumb-current">Learning Dashboard</span>
        </nav>

        <header className="dashboard-welcome-header">
          <h1 className="dashboard-welcome-title">Welcome back, {firstName}</h1>
          <p className="dashboard-welcome-sub">
            Check your score, track your daily habit, and continue your roadmap.
          </p>
        </header>

        {/* 1. Top Score & Stats Bar (High AA Contrast in Both Dark & Light Themes) */}
        <section className="duo-dashboard-stats-strip" aria-label="Citizen Learning Stats">
          <div className="duo-dash-stat-item">
            <div className="duo-stat-icon-box flame-box">
              <Flame size={22} className="stat-flame-icon" aria-hidden="true" />
            </div>
            <div className="stat-text-meta">
              <span className="duo-stat-label">Daily Streak</span>
              <strong className="duo-stat-value">{streakDays} Days</strong>
            </div>
          </div>

          <div className="duo-dash-stat-divider" aria-hidden="true" />

          <div className="duo-dash-stat-item">
            <div className="duo-stat-icon-box xp-box">
              <Zap size={20} className="stat-xp-icon" aria-hidden="true" />
            </div>
            <div className="stat-text-meta">
              <span className="duo-stat-label">XP</span>
              <strong className="duo-stat-value">{totalXp} XP</strong>
            </div>
          </div>

          <div className="duo-dash-stat-divider" aria-hidden="true" />

          <div className="duo-dash-stat-item">
            <div className="duo-stat-icon-box goal-box">
              <Target size={20} className="stat-goal-icon" aria-hidden="true" />
            </div>
            <div className="stat-text-meta">
              <span className="duo-stat-label">Today's Target</span>
              <strong className="duo-stat-value">{todayProgress} / {dailyTarget} Lessons</strong>
            </div>
          </div>

          <div className="duo-dash-stat-divider" aria-hidden="true" />

          <div className="duo-dash-stat-item">
            <div className="duo-stat-icon-box accuracy-box">
              <Award size={20} className="stat-accuracy-icon" aria-hidden="true" />
            </div>
            <div className="stat-text-meta">
              <span className="duo-stat-label">Quiz score</span>
              <strong className="duo-stat-value">{accuracy}% Accuracy</strong>
            </div>
          </div>
        </section>

        {/* 2. "Active Milestone" Banner (IMAGE D style) */}
        <section className="resume-hero-card" aria-labelledby="resume-heading">
          <div className="resume-hero-inner">
            <div className="resume-hero-meta">
              <span className="resume-badge">
                <PlayCircle size={14} aria-hidden="true" />
                <span>ACTIVE MILESTONE &bull; NEXT UP</span>
              </span>
              <h2 id="resume-heading" className="resume-title">
                {next ? next.title : 'The Preamble as a key to reading the Constitution'}
              </h2>
              <p className="resume-desc">
                Learn the foundational principle in 3 minutes with real-world examples, then test your knowledge in an interactive quiz.
              </p>
            </div>

            <div className="resume-hero-cta">
              <Link
                to="/learn/the-preamble-and-sovereignty/preamble-we-the-people"
                className="btn btn-primary resume-btn"
              >
                <span>Continue Learning</span>
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* 3. Clean Segmented Navigation Tab Bar (Sliding Indicator, Zero Clipping) */}
        <div className="dashboard-segmented-tab-wrapper">
          <div className="dashboard-subnav-row" role="tablist" aria-label="Learning views">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'path'}
              className={`dash-subnav-btn ${activeTab === 'path' ? 'is-active' : ''}`}
              onClick={() => setSearchParams({ tab: 'path' })}
            >
              <Compass size={16} aria-hidden="true" />
              <span>Your path</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'courses'}
              className={`dash-subnav-btn ${activeTab === 'courses' ? 'is-active' : ''}`}
              onClick={() => setSearchParams({ tab: 'courses' })}
            >
              <CheckCircle2 size={16} aria-hidden="true" />
              <span>Courses</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'constitution'}
              className={`dash-subnav-btn ${activeTab === 'constitution' ? 'is-active' : ''}`}
              onClick={() => setSearchParams({ tab: 'constitution' })}
            >
              <Landmark size={16} aria-hidden="true" />
              <span>Constitution Map</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'library'}
              className={`dash-subnav-btn ${activeTab === 'library' ? 'is-active' : ''}`}
              onClick={() => setSearchParams({ tab: 'library' })}
            >
              <Library size={16} aria-hidden="true" />
              <span>Legal Library &amp; Guides</span>
            </button>
          </div>
        </div>

        {/* 4. Tab Content */}
        {activeTab === 'path' && (
          <div className="duo-dashboard-grid">
            {/* Main Center Winding Path */}
            <div className="duo-path-column">
              <LearningPath />
            </div>

            {/* Right Practice & Gamification Column */}
            <aside className="duo-sidebar-column">
              <DailyPracticeWidget />
              <BadgeShelf />

              {/* Pattern 16: Invite a Friend Dashboard Card */}
              <div className="card duo-card samvidhan-glow-card" style={{ marginTop: '1.25rem', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <Users size={18} className="text-gold" aria-hidden="true" />
                  <strong style={{ fontSize: '0.98rem' }}>Invite a Citizen Friend</strong>
                </div>
                <p className="muted" style={{ fontSize: '0.84rem', margin: '0 0 0.85rem', lineHeight: 1.45 }}>
                  Share constitutional literacy. Earn streak shields and Pro access when your friends join.
                </p>
                <Link to="/refer" className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  <span>Get Invite Link</span>
                  <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </div>
            </aside>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="dashboard-courses-grid">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

        {activeTab === 'constitution' && <DashboardConstitutionView />}

        {activeTab === 'library' && <DashboardLibraryView />}
      </main>
    </div>
  )
}
