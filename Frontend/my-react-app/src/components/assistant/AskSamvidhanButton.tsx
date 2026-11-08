import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Scale } from 'lucide-react'
import { NudgeBubble } from './NudgeBubble'
import { ChatPanel } from './ChatPanel'

const pageQuestions: Record<string, string> = {
  '/constitution': 'What are my fundamental rights under Article 21?',
  '/constitution/part-iii': 'How does Habeas Corpus protect against illegal detention?',
  '/learn': 'Which masterclass should I take for everyday police and tenant rights?',
  '/library': 'How do I draft an RTI application with statutory deadlines?',
  '/dashboard': 'What is the D.K. Basu guideline for arrest memos?',
  default: 'What are my constitutional rights if detained by police?',
}

interface AskSamvidhanButtonProps {
  initialQuery?: string | null
}

export function AskSamvidhanButton({ initialQuery }: AskSamvidhanButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showNudge, setShowNudge] = useState(false)
  const [activeQuery, setActiveQuery] = useState<string | null>(initialQuery || null)
  const location = useLocation()

  const currentQuestion = pageQuestions[location.pathname] || pageQuestions.default

  // Listen for open-ask-samvidhan event from SearchPalette or other parts of app
  useEffect(() => {
    const handleCustomOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ query?: string }>
      if (customEvent.detail?.query) {
        setActiveQuery(customEvent.detail.query)
      }
      setIsOpen(true)
      setShowNudge(false)
    }

    window.addEventListener('open-ask-samvidhan', handleCustomOpen)
    return () => window.removeEventListener('open-ask-samvidhan', handleCustomOpen)
  }, [])

  // Nudge logic: Show once per session after ~8s, auto-dismiss after 10s
  useEffect(() => {
    // Never show on login or register page
    if (location.pathname.startsWith('/login') || location.pathname.startsWith('/register')) {
      return
    }

    const dismissed = sessionStorage.getItem('samvidhan-nudge-dismissed')
    if (dismissed) return

    // Show after 8 seconds
    const showTimer = setTimeout(() => {
      setShowNudge(true)

      // Auto-dismiss after 10 seconds of being shown
      const autoDismissTimer = setTimeout(() => {
        setShowNudge(false)
      }, 10000)

      return () => clearTimeout(autoDismissTimer)
    }, 8000)

    return () => clearTimeout(showTimer)
  }, [location.pathname])

  const handleDismissNudge = () => {
    setShowNudge(false)
    sessionStorage.setItem('samvidhan-nudge-dismissed', 'true')
  }

  const handleOpenFromNudge = () => {
    handleDismissNudge()
    setActiveQuery(currentQuestion)
    setIsOpen(true)
  }

  // Do not show floating button or nudge on login / register pages
  if (location.pathname.startsWith('/login') || location.pathname.startsWith('/register')) {
    return null
  }

  return (
    <>
      <div className="ask-floating-container">
        {showNudge && !isOpen && (
          <NudgeBubble
            question={currentQuestion}
            onOpen={handleOpenFromNudge}
            onDismiss={handleDismissNudge}
          />
        )}

        <button
          type="button"
          className="ask-floating-btn"
          onClick={() => {
            setIsOpen(!isOpen)
            if (showNudge) handleDismissNudge()
          }}
          aria-label="Open Ask Samvidhan AI Assistant"
          aria-expanded={isOpen}
        >
          <Scale size={24} className="ask-floating-icon" aria-hidden="true" />
          <span className="ask-floating-label">Ask Samvidhan</span>
        </button>
      </div>

      <ChatPanel
        open={isOpen}
        onClose={() => {
          setIsOpen(false)
          setActiveQuery(null)
        }}
        initialQuestion={activeQuery}
      />
    </>
  )
}
