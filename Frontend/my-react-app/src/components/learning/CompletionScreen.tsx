import { Award, RotateCcw, ArrowRight } from 'lucide-react'
import { Mor } from '../mascot/Mor'

interface CompletionScreenProps {
  title: string
  xpEarned: number
  accuracy?: number
  streak: number
  onContinue: () => void
  onReview?: () => void
}

export function CompletionScreen({
  title,
  xpEarned,
  accuracy = 100,
  streak,
  onContinue,
  onReview,
}: CompletionScreenProps) {
  return (
    <div className="duo-completion-screen" role="region" aria-label="Lesson completed celebration">
      {/* Background festive rays */}
      <div className="completion-rays" aria-hidden="true" />

      {/* Floating Confetti Elements */}
      <div className="confetti-field" aria-hidden="true">
        {[...Array(18)].map((_, i) => (
          <span
            key={i}
            className={`confetti-particle p-${i % 6}`}
            style={{
              left: `${(i * 5.5 + 3) % 100}%`,
              animationDelay: `${(i * 0.12) % 1.5}s`,
              transform: `scale(${0.6 + (i % 5) * 0.15})`,
            }}
          />
        ))}
      </div>

      <div className="completion-card">
        {/* Celebrating Mor Mascot with full fanned tail */}
        <div style={{ margin: '0 auto 1rem', display: 'flex', justifyContent: 'center' }}>
          <Mor mood="celebrate" size={130} />
        </div>

        <span className="completion-eyebrow">Lesson Mastered</span>
        <h2 className="completion-title">{title}</h2>
        <p className="completion-sub">
          You have expanded your constitutional awareness. Knowledge of the law is your greatest civic defense.
        </p>

        {/* Stats Row */}
        <div className="completion-stats-grid">
          <div className="completion-stat-card">
            <span className="stat-card-label">XP Earned</span>
            <div className="stat-card-value xp-glow">+{xpEarned} XP</div>
          </div>

          <div className="completion-stat-card">
            <span className="stat-card-label">Accuracy</span>
            <div className="stat-card-value gold-glow">{accuracy}%</div>
          </div>

          <div className="completion-stat-card">
            <span className="stat-card-label">Daily Streak</span>
            <div className="stat-card-value flame-glow">🔥 {streak} days</div>
          </div>
        </div>

        {/* Actions */}
        <div className="completion-actions">
          {onReview && (
            <button
              type="button"
              className="btn btn-secondary review-mistakes-btn"
              onClick={onReview}
            >
              <RotateCcw size={16} aria-hidden="true" />
              <span>Review Lesson</span>
            </button>
          )}

          <button
            type="button"
            className="btn btn-primary continue-learning-btn"
            onClick={onContinue}
            autoFocus
          >
            <span>Continue Path</span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="completion-legal-quote">
          <Award size={14} aria-hidden="true" />
          <span>&ldquo;Educate, Agitate, Organise.&rdquo; &mdash; Dr. B.R. Ambedkar</span>
        </div>
      </div>
    </div>
  )
}