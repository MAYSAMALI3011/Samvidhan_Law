import { useState, useRef, useEffect } from 'react'
import { BookOpen, X, Check } from 'lucide-react'

export interface KeyWordChipProps {
  term: string
  definition: string
  className?: string
}

export function KeyWordChip({ term, definition, className = '' }: KeyWordChipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hasViewed, setHasViewed] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const toggleOpen = () => {
    setIsOpen((prev) => {
      const next = !prev
      if (next) setHasViewed(true)
      return next
    })
  }

  // Handle escape key to close popover
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className={`keyword-chip-wrapper ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        className={`keyword-chip ${isOpen ? 'is-active' : ''} ${hasViewed ? 'is-viewed' : ''}`}
        onClick={toggleOpen}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        title={`View plain-English definition for "${term}"`}
      >
        <BookOpen size={13} className="keyword-chip-icon text-gold" aria-hidden="true" />
        <span className="keyword-chip-term">{term}</span>
        {hasViewed && (
          <Check size={12} className="keyword-viewed-indicator" aria-hidden="true" />
        )}
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          className="keyword-definition-popover"
          role="dialog"
          aria-label={`Definition of ${term}`}
        >
          <div className="popover-header">
            <div className="popover-badge">
              <BookOpen size={12} aria-hidden="true" />
              <span>PLAIN-ENGLISH CIVIC DEFINITION</span>
            </div>
            <button
              type="button"
              className="popover-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close definition"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
          <strong className="popover-term">{term}</strong>
          <p className="popover-definition">{definition}</p>
        </div>
      )}
    </div>
  )
}
