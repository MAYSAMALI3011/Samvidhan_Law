import { useState } from 'react'
import { Calendar, Clock, Flame, ShieldAlert, ArrowRight, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppState } from '../../context/useAppState'
import { Mor } from '../mascot/Mor'

export function DailyPracticeWidget() {
  const { progress } = useAppState()
  const streak = progress.streak ?? 0
  const [streakFrozen, setStreakFrozen] = useState(false)

  // 7 days of the week: Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6
  const isStreakAtRisk = (streak > 0 && progress.completedLessonIds.length === 0) && !streakFrozen
  const dayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const todayIdx = (new Date().getDay() + 6) % 7
  const weekly = progress.weeklyHistory || []
  const days = dayLetters.map((day, idx) => ({
    day,
    completed: Boolean(weekly[idx]?.completed),
    isToday: idx === todayIdx,
  }))

  return (
    <div className="daily-practice-container" role="region" aria-label="Daily Practice and Habit Dashboard">
      {/* 1. Article of the Day Card */}
      <div className="article-of-the-day-card samvidhan-glow-card">
        <div className="aotd-topbar">
          <div className="aotd-pill">
            <Calendar size={13} className="text-gold" aria-hidden="true" />
            <span>ARTICLE OF THE DAY</span>
          </div>
          <span className="aotd-time-est">
            <Clock size={13} aria-hidden="true" /> 2 min read
          </span>
        </div>

        <div className="aotd-body-layout">
          <div className="aotd-text-content">
            <h3 className="aotd-title">Article 51A(h): Duty of Inquiry</h3>
            <p className="aotd-summary">
              &ldquo;It shall be the duty of every citizen of India to develop the scientific temper, humanism and the spirit of inquiry and reform.&rdquo;
            </p>
            <span className="aotd-source-tag">Article 51A(h), Part IVA, Constitution of India</span>
          </div>

          <div className="aotd-mascot-corner" aria-hidden="true">
            <Mor mood="wave" size={56} />
          </div>
        </div>

        <div className="aotd-action-row">
          <Link to="/learn/constitutional-foundations/preamble-philosophy" className="btn btn-primary btn-sm">
            <span>Read the 2-minute lesson</span>
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* 2. Streak Tracker & 7-Column Horizontal Calendar */}
      <div className="streak-tracker-card samvidhan-glow-card">
        <div className="streak-head-row">
          <div className="streak-flame-badge">
            <Flame size={22} className="flame-icon pulsing-flame" aria-hidden="true" />
            <div>
              <strong className="streak-count-text">{streak} Day Streak</strong>
              <p className="streak-sub-text">
                {isStreakAtRisk ? 'Streak at risk! Complete 1 lesson today.' : 'Practice today to keep your momentum.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Mor
              mood={isStreakAtRisk ? 'sleepy' : 'encourage'}
              size={48}
              decorative
            />

            {(progress.streakFreezes || 0) > 0 && (
              <button
                type="button"
                className={`streak-freeze-btn ${streakFrozen ? 'is-active' : ''}`}
                onClick={() => setStreakFrozen(!streakFrozen)}
                title="Protect your streak if you miss a day"
                aria-label="Toggle streak freeze protection"
              >
                <ShieldAlert size={14} aria-hidden="true" />
                <span>{streakFrozen ? 'Streak Shielded' : '1 Freeze Available'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Horizontal 7-Day Grid: Letter on Top, Circular Badge Below */}
        <div className="streak-week-circles" aria-label="Weekly streak completion">
          {days.map((item, idx) => (
            <div
              key={idx}
              className={`day-circle-pill ${item.completed ? 'is-done' : ''} ${item.isToday ? 'is-today' : ''}`}
              title={`${item.day}: ${item.isToday ? 'Today (Active)' : item.completed ? 'Completed' : 'Upcoming'}`}
            >
              <span className="day-name">{item.day}</span>
              <div className="day-dot">
                {item.isToday ? (
                  <Flame size={14} className="text-today-flame pulsing-flame" />
                ) : item.completed ? (
                  <Check size={13} strokeWidth={3} className="text-check-done" />
                ) : (
                  <span className="muted-day-dot" aria-hidden="true" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
