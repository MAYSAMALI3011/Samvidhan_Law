import { X, HelpCircle } from 'lucide-react'
import { SegmentedProgress } from './SegmentedProgress'
import { StreakChip } from './StreakChip'
import { XpChip } from './XpChip'

export interface LessonTopBarProps {
  totalSegments: number
  currentIndex: number
  streak?: number
  xp?: number
  onCloseClick: () => void
  onHelpClick?: () => void
  className?: string
}

export function LessonTopBar({
  totalSegments,
  currentIndex,
  streak = 3,
  xp = 15,
  onCloseClick,
  onHelpClick,
  className = '',
}: LessonTopBarProps) {
  return (
    <header className={`lesson-top-bar ${className}`}>
      <div className="top-bar-inner">
        {/* Left: Close button */}
        <div className="top-bar-left">
          <button
            type="button"
            className="lesson-close-btn"
            onClick={onCloseClick}
            aria-label="Exit lesson and return to curriculum"
            title="Exit lesson"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Center: Progress Bar */}
        <div className="top-bar-center">
          <SegmentedProgress totalSegments={totalSegments} currentIndex={currentIndex} />
        </div>

        {/* Right: Stats & Help */}
        <div className="top-bar-right">
          <StreakChip streak={streak} />
          <XpChip amount={xp} />

          {onHelpClick && (
            <button
              type="button"
              className="lesson-help-btn"
              onClick={onHelpClick}
              aria-label="Ask Samvidhan legal assistant for help"
              title="Need help understanding this lesson? Ask Samvidhan AI"
            >
              <HelpCircle size={15} aria-hidden="true" />
              <span className="help-btn-text">Need help?</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
