import { useState } from 'react'
import { Copy, Check, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'
import { FeatherAvatar } from '../chatbot/FeatherAvatar'
import { FollowUpChips } from './FollowUpChips'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  citations?: { label: string; url?: string }[]
  followUps?: string[]
}

interface MessageBubbleProps {
  message: ChatMessage
  onFollowUpClick: (query: string) => void
}

export function MessageBubble({ message, onFollowUpClick }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <div className={`chat-bubble-wrap ${isUser ? 'chat-bubble-user-wrap' : 'chat-bubble-ai-wrap'}`}>
      {!isUser && (
        <div className="chat-bubble-avatar-disc" style={{ marginRight: '8px', flexShrink: 0, marginTop: '4px' }}>
          <FeatherAvatar size={20} mode="dark" />
        </div>
      )}
      <div className={`chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
        <p className="chat-bubble-text">{message.text}</p>

        {/* Citations as Clickable Pills */}
        {message.citations && message.citations.length > 0 && (
          <div className="chat-citations-strip">
            {message.citations.map((c, i) => (
              c.url ? (
                <Link key={i} to={c.url} className="citation-pill">
                  <Shield size={12} aria-hidden="true" />
                  <span>{c.label}</span>
                </Link>
              ) : (
                <span key={i} className="citation-pill">
                  <Shield size={12} aria-hidden="true" />
                  <span>{c.label}</span>
                </span>
              )
            ))}
          </div>
        )}

        {!isUser && (
          <div className="chat-bubble-actions">
            <button
              type="button"
              className="chat-action-btn"
              onClick={handleCopy}
              title="Copy answer"
              aria-label="Copy assistant answer"
            >
              {copied ? <Check size={13} style={{ color: 'var(--success)' }} /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Follow-up question chips */}
      {!isUser && message.followUps && (
        <FollowUpChips chips={message.followUps} onSelect={onFollowUpClick} />
      )}
    </div>
  )
}
