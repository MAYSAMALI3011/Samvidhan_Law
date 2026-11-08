import React, { useState, useRef, useEffect } from 'react'
import {
  X,
  Send,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react'
import { FeatherAvatar } from '../chatbot/FeatherAvatar'
import { MessageBubble, type ChatMessage } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'

const defaultWelcomeMessage: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text: 'Namaste! I am Ask Samvidhan, your civic and constitutional research assistant. Ask any question regarding Fundamental Rights, police arrest guidelines, consumer fraud, or RTI filings.',
  citations: [
    { label: 'The Constitution of India, 1950', url: '/constitution' },
    { label: 'Right to Information Act, 2005', url: '/library/sample-rti-application' },
  ],
  followUps: [
    'What are my rights if police detain me?',
    'How do I file an RTI application?',
    'What does Article 21 protect?',
  ],
}

interface ChatPanelProps {
  open: boolean
  onClose: () => void
  initialQuestion?: string | null
}

export function ChatPanel({ open, onClose, initialQuestion }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([defaultWelcomeMessage])
  const [input, setInput] = useState(initialQuestion || '')
  const [loading, setLoading] = useState(false)
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)
  const chatScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [messages, loading])

  const handleSendQuery = (textToSend?: string) => {
    const q = (textToSend || input).trim()
    if (!q || loading) return

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: q,
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // Simulate verified legal research response
    setTimeout(() => {
      let aiText: string
      let citations: { label: string; url?: string }[]
      let followUps: string[]

      const lower = q.toLowerCase()
      if (lower.includes('arrest') || lower.includes('police')) {
        aiText = 'Under Article 22(1) and Section 50 of the CrPC, any person arrested must be immediately informed of the grounds of arrest and has an absolute right to consult and be defended by a legal practitioner. Per the Supreme Court\'s mandatory D.K. Basu guidelines, police officers must prepare an arrest memo with at least one witness signature and notify a family member within 8-12 hours.'
        citations = [
          { label: 'Article 22(1) Constitution', url: '/constitution/part-iii' },
          { label: 'Section 50 CrPC', url: '/library/fir-checklist' },
          { label: 'D.K. Basu v. State of W.B. (1997)' },
        ]
        followUps = ['Can women be arrested after sunset?', 'What is zero FIR procedure?']
      } else if (lower.includes('rti') || lower.includes('information')) {
        aiText = 'Under the Right to Information Act, 2005 (Section 6), any Indian citizen can request public records from a Public Information Officer (PIO). The statutory time limit to reply is 30 days (or 48 hours if it concerns life or liberty). If no reply arrives, a First Appeal lies to the designated Senior Officer under Section 19(1).'
        citations = [
          { label: 'RTI Act 2005 Sec. 6 & 7', url: '/library/sample-rti-application' },
          { label: 'Section 19(1) First Appeal' },
        ]
        followUps = ['What is the fee for an RTI application?', 'Which agencies are exempt under RTI?']
      } else if (lower.includes('article 21') || lower.includes('privacy') || lower.includes('liberty')) {
        aiText = 'Article 21 guarantees that no person shall be deprived of his life or personal liberty except according to procedure established by law. In Maneka Gandhi (1978), the Supreme Court ruled that such procedure must be just, fair, and reasonable. In K.S. Puttaswamy (2017), a 9-judge bench unanimously recognized the Fundamental Right to Privacy.'
        citations = [
          { label: 'Article 21 Constitution', url: '/constitution/part-iii' },
          { label: 'Maneka Gandhi v. Union of India (1978)' },
          { label: 'K.S. Puttaswamy v. Union of India (2017)' },
        ]
        followUps = ['What is the Basic Structure doctrine?', 'How does Article 32 enforce Article 21?']
      } else {
        aiText = 'Under Indian constitutional and statutory law, your rights are anchored in Part III (Articles 12-35) and governed by specialized Central Acts. All state actions must pass the Article 14 non-arbitrariness doctrine established in E.P. Royappa.'
        citations = [
          { label: 'Part III of the Constitution', url: '/constitution/part-iii' },
          { label: 'Article 14 Equality Doctrine' },
        ]
        followUps = ['How do I file a consumer complaint?', 'What are Fundamental Duties?']
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: aiText,
        citations,
        followUps,
      }

      setMessages((prev) => [...prev, aiMsg])
      setLoading(false)
    }, 750)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendQuery()
    }
  }

  const handleNewChat = () => {
    setMessages([defaultWelcomeMessage])
    setInput('')
  }

  if (!open) return null

  return (
    <div className="chat-panel-container" role="dialog" aria-modal="true" aria-label="Ask Samvidhan AI Assistant">
      {/* Header */}
      <div className="chat-panel-header">
        <div className="chat-header-title-box">
          <FeatherAvatar size={22} mode="dark" className="chat-header-icon" aria-hidden="true" />
          <div>
            <h3 className="chat-header-title">Ask Samvidhan</h3>
            <span className="chat-header-badge">Educational Demo</span>
          </div>
        </div>

        <div className="chat-header-controls">
          <button
            type="button"
            className="chat-header-btn"
            onClick={handleNewChat}
            title="New Chat"
            aria-label="Start new conversation"
          >
            <RotateCcw size={15} />
          </button>
          <button
            type="button"
            className="chat-header-btn"
            onClick={onClose}
            title="Close Assistant"
            aria-label="Close assistant panel"
          >
            <X size={17} />
          </button>
        </div>
      </div>

      {/* Short Legal Disclaimer Pill */}
      {!disclaimerAccepted && (
        <div className="chat-disclaimer-banner">
          <ShieldAlert size={16} className="chat-disclaimer-icon" aria-hidden="true" />
          <p className="chat-disclaimer-text">
            <strong>Civic Education Demo:</strong> Generates citations for literacy only. Not legal advice.
          </p>
          <button
            type="button"
            className="chat-disclaimer-ack-btn"
            onClick={() => setDisclaimerAccepted(true)}
          >
            Got it
          </button>
        </div>
      )}

      {/* Message Feed */}
      <div className="chat-messages-scroll" ref={chatScrollRef}>
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            onFollowUpClick={(q) => handleSendQuery(q)}
          />
        ))}

        {loading && (
          <div className="chat-bubble-wrap chat-bubble-ai-wrap">
            <div className="chat-bubble chat-bubble-ai">
              <TypingIndicator />
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        className="chat-input-bar"
        onSubmit={(e) => {
          e.preventDefault()
          handleSendQuery()
        }}
      >
        <textarea
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about Indian law, RTI, police rights..."
          className="chat-textarea"
          aria-label="Ask Samvidhan legal assistant question"
        />
        <button
          type="submit"
          className="chat-send-btn"
          disabled={!input.trim() || loading}
          aria-label="Send query"
        >
          <Send size={16} aria-hidden="true" />
        </button>
      </form>
    </div>
  )
}
