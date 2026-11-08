import { Flame, Zap, Volume2, VolumeX } from 'lucide-react'
import { useAppState } from '../../context/useAppState'
import { Tooltip } from '../animations/Tooltip'

export function StreakXpHeader() {
  const { progress, toggleSound } = useAppState()
  const streak = progress.streak || 1
  const xp = progress.xp || 0
  const dailyGoal = progress.dailyGoal || 30
  const progressRatio = Math.min(1, (xp % dailyGoal || xp) / dailyGoal)
  const radius = 12
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - progressRatio * circumference

  return (
    <div className="learning-stats-bar" role="region" aria-label="Learning streak and progress stats">
      {/* Streak Badge */}
      <Tooltip content={`${streak}-day streak! Practice daily to keep the flame alive.`}>
        <div className="stat-pill streak-pill" tabIndex={0} aria-label={`${streak} day learning streak`}>
          <Flame size={17} className="flame-icon pulsing-flame" aria-hidden="true" />
          <span className="stat-value">{streak}</span>
          <span className="stat-label">days</span>
        </div>
      </Tooltip>

      {/* XP Pill */}
      <Tooltip content="Total Experience Points earned through lessons and quizzes.">
        <div className="stat-pill xp-pill" tabIndex={0} aria-label={`${xp} XP earned`}>
          <Zap size={16} className="xp-icon" aria-hidden="true" />
          <span className="stat-value">{xp}</span>
          <span className="stat-label">XP</span>
        </div>
      </Tooltip>

      {/* Daily Goal Progress Ring */}
      <Tooltip content={`Daily Goal: ${Math.round(progressRatio * 100)}% completed (${dailyGoal} XP target)`}>
        <div className="stat-pill goal-pill" tabIndex={0} aria-label={`Daily goal ${Math.round(progressRatio * 100)} percent complete`}>
          <div className="goal-ring-wrapper">
            <svg width="28" height="28" viewBox="0 0 32 32" className="goal-svg">
              <circle
                cx="16"
                cy="16"
                r={radius}
                className="goal-ring-bg"
                strokeWidth="3"
                fill="none"
              />
              <circle
                cx="16"
                cy="16"
                r={radius}
                className="goal-ring-progress"
                strokeWidth="3"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 16 16)"
              />
            </svg>
            <span className="goal-center-text">🎯</span>
          </div>
          <span className="stat-label">Goal</span>
        </div>
      </Tooltip>

      {/* Sound Toggle */}
      <Tooltip content={progress.soundEnabled ? 'Mute sound effects' : 'Enable audio chimes'}>
        <button
          type="button"
          className="stat-pill sound-toggle-pill"
          onClick={toggleSound}
          aria-label={progress.soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
        >
          {progress.soundEnabled ? (
            <Volume2 size={16} className="sound-icon is-on" aria-hidden="true" />
          ) : (
            <VolumeX size={16} className="sound-icon is-off" aria-hidden="true" />
          )}
        </button>
      </Tooltip>
    </div>
  )
}