import { useState } from 'react'
import { BookOpen, ChevronDown } from 'lucide-react'

export interface OfficialTextAccordionProps {
  articleNumber?: string
  articleText: string
  landmarkCase?: string
  defaultOpen?: boolean
  className?: string
}

export function OfficialTextAccordion({
  articleNumber,
  articleText,
  landmarkCase,
  defaultOpen = false,
  className = '',
}: OfficialTextAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const contentId = `official-text-${(articleNumber || 'statute').toLowerCase().replace(/[^a-z0-9]/g, '-')}`

  return (
    <div className={`official-statutory-accordion ${isOpen ? 'is-open' : ''} ${className}`}>
      <button
        type="button"
        className="accordion-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <div className="accordion-trigger-left">
          <BookOpen size={16} className="text-gold" aria-hidden="true" />
          <span className="trigger-title">
            Official Text: {articleNumber || 'Constitutional Statute'}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`accordion-chevron ${isOpen ? 'is-rotated' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div id={contentId} className="accordion-content-panel" role="region">
          <blockquote className="official-verbatim-quote">
            <span className="quote-mark-open" aria-hidden="true">&ldquo;</span>
            {articleText}
            <span className="quote-mark-close" aria-hidden="true">&rdquo;</span>
          </blockquote>

          {landmarkCase && (
            <div className="landmark-precedent-box">
              <span className="precedent-label">Landmark Precedent:</span>
              <span className="precedent-text">{landmarkCase}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
