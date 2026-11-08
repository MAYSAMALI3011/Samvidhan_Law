
export interface SegmentedProgressProps {
  totalSegments: number
  currentIndex: number
  className?: string
}

export function SegmentedProgress({
  totalSegments,
  currentIndex,
  className = '',
}: SegmentedProgressProps) {
  const percent = Math.round(((currentIndex + 1) / totalSegments) * 100)

  return (
    <div
      className={`segmented-progress-track ${className}`}
      role="progressbar"
      aria-label="Lesson Progress"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {Array.from({ length: totalSegments }).map((_, i) => {
        const isComplete = i < currentIndex
        const isCurrent = i === currentIndex

        return (
          <div
            key={i}
            className={`progress-segment ${isComplete ? 'is-complete' : ''} ${isCurrent ? 'is-current' : ''}`}
          >
            <div className="segment-fill" />
          </div>
        )
      })}
    </div>
  )
}
