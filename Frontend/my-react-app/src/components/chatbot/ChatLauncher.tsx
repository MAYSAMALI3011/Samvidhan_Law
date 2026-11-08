import { useState, useEffect, useCallback } from 'react'
import { FeatherAvatar } from './FeatherAvatar'

export interface ChatLauncherProps {
  isOpen: boolean
  onToggle: () => void
}

export function ChatLauncher({ isOpen, onToggle }: ChatLauncherProps) {
  const [showNudge, setShowNudge] = useState(false)
  const [pillExpanded, setPillExpanded] = useState(() => {
    try {
      return !sessionStorage.getItem('samvidhan-chat-intro-seen')
    } catch {
      return false
    }
  })

  const handleDismissNudge = useCallback(() => {
    setShowNudge(false)
    try {
      localStorage.setItem('samvidhan-nudge-dismissed', 'true')
    } catch {
      /* ignore storage error */
    }
  }, [])

  // Show attached pill on first visit for 4 seconds, then collapse
  useEffect(() => {
    if (pillExpanded) {
      const timer = setTimeout(() => {
        setPillExpanded(false)
        try {
          sessionStorage.setItem('samvidhan-chat-intro-seen', 'true')
        } catch {
          /* ignore storage error */
        }
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [pillExpanded])

  // Show suggestion nudge bubble once per session after 3s, auto-dismiss after 8s
  useEffect(() => {
    let isDismissed = false
    try {
      isDismissed = localStorage.getItem('samvidhan-nudge-dismissed') === 'true'
    } catch {
      /* ignore storage error */
    }

    if (!isDismissed) {
      const showTimer = setTimeout(() => {
        setShowNudge(true)
      }, 3000)

      // Auto-hide after 8 seconds
      const hideTimer = setTimeout(() => {
        handleDismissNudge()
      }, 11000)

      return () => {
        clearTimeout(showTimer)
        clearTimeout(hideTimer)
      }
    }
  }, [handleDismissNudge])

  // Auto-hide nudge on scroll so it never obstructs reading or footers
  useEffect(() => {
    if (!showNudge) return
    const handleScroll = () => {
      if (window.scrollY > 100) {
        handleDismissNudge()
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [showNudge, handleDismissNudge])

  return (
    <aside className="ask-samvidhan-launcher-root" aria-label="Ask Samvidhan legal assistant launcher">
      {/* Friendly Suggestion Nudge Bubble (auto-hides on scroll or 8s timeout) */}
      {showNudge && !isOpen && (
        <div className="ask-launcher-nudge samvidhan-glow-card" role="status">
          <span>Ask about your rights in simple words</span>
          <button
            type="button"
            className="nudge-dismiss-btn"
            onClick={handleDismissNudge}
            aria-label="Dismiss suggestion"
          >
            &times;
          </button>
        </div>
      )}

      {/* ONE Single Bottom-Right Launcher (Navy 60px Circle with Attached Sliding Label Pill) */}
      <div
        className={`ask-unified-launcher-pill ${pillExpanded ? 'is-pill-expanded' : ''}`}
        onMouseEnter={() => setPillExpanded(true)}
        onMouseLeave={() => setPillExpanded(false)}
      >
        <button
          type="button"
          className="ask-floating-circle-btn"
          onClick={() => {
            handleDismissNudge()
            onToggle()
          }}
          aria-label={isOpen ? 'Close Ask Samvidhan assistant' : 'Open Ask Samvidhan AI Assistant'}
          title="Ask Samvidhan — Your simple guide to Indian law"
        >
          {/* Sliding Attached Label Pill */}
          <span className="launcher-attached-label">Ask Samvidhan</span>

          {/* Plume Emblem inside 60px Navy Circle */}
          <div className="chat-launcher-plume-sway" aria-hidden="true">
            <FeatherAvatar size={34} mode="dark" />
          </div>

          {/* Online Guide Indicator Dot */}
          <span className="launcher-online-dot" title="Online educational guide" aria-hidden="true" />
        </button>
      </div>
    </aside>
  )
}
