import React, { useState, useRef, useEffect } from 'react'
import {
  X,
  Send,
  Square,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  ArrowDown,
  Plus,
  Maximize2,
  Minimize2,
  RotateCcw,
} from 'lucide-react'
import { FeatherMark } from '../chatbot/FeatherMark'
import { FeatherAvatar } from '../chatbot/FeatherAvatar'
import { FeatherPen } from '../chatbot/FeatherPen'
import { StreamingMarkdown } from './streaming/StreamingMarkdown'
import { useChatStream } from './streaming/useChatStream'
import { useAutosave } from '../../hooks/useAutosave'
import { useThrottledCallback } from '../../hooks/useThrottledCallback'
import { AutosaveStatusBadge } from '../../ui/feedback/AutosaveStatusBadge'
import { AiTypingShimmer } from '../../ui/skeletons'
import { ProGateModal } from '../../ui/growth/ProGateModal'
import { getAiDailyUsage, getCurrentTier } from '../../utils/tiers'
import { AutoGrowTextarea } from '../ui/TextFields.jsx'
import { Mor } from '../mascot/Mor'
import '../chatbot/chatbot.tokens.css'

interface AskSamvidhanModalProps {
  isOpen: boolean
  onClose: () => void
}

const defaultSuggestedChips = [
  'Can police search my phone without a warrant?',
  'What are my rights if detained by police?',
  'How to file an RTI in simple steps?',
  'What does Article 21 protect?',
]

export function AskSamvidhanModal({ isOpen, onClose }: AskSamvidhanModalProps) {
  const { messages, isGenerating, sendMessage, stopGeneration, clearChat } = useChatStream()
  const [inputText, setInputText] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [ratedMessages, setRatedMessages] = useState<Record<string, 'up' | 'down'>>({})
  const [showScrollBottom, setShowScrollBottom] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [proModalOpen, setProModalOpen] = useState(false)
  const usage = getAiDailyUsage()
  const tier = getCurrentTier()

  // Pattern 6: Autosave user query draft
  const { status: autosaveStatus, getSavedDraft, clearDraft } = useAutosave<string>({
    key: 'ask-samvidhan-draft',
    value: inputText,
    debounceMs: 600,
    enabled: isOpen,
  })

  // Restore draft on mount or open
  useEffect(() => {
    if (isOpen) {
      const saved = getSavedDraft()
      if (saved && !inputText) {
        setInputText(saved)
      }
    }
  }, [isOpen])

  // Pattern 8: Rate-limit send button to prevent spamming
  const { throttledFn: throttledSend, isLocked: isSendThrottled } = useThrottledCallback(
    (textToSend?: string) => {
      const q = textToSend || inputText
      if (!q.trim() || isGenerating) return
      sendMessage(q)
      setInputText('')
      clearDraft()
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    },
    500,
    { leading: true, trailing: false }
  )

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom while streaming
  useEffect(() => {
    if (!scrollAreaRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 140

    if (isNearBottom || isGenerating) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isGenerating])

  // Escape key closes modal
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleScroll = () => {
    if (!scrollAreaRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current
    const isFarFromBottom = scrollHeight - scrollTop - clientHeight > 160
    setShowScrollBottom(isFarFromBottom)
  }

  const handleJumpToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    setShowScrollBottom(false)
  }

  const handleSend = (textToSend?: string) => {
    const q = textToSend || inputText
    if (!q.trim() || isGenerating) return
    sendMessage(q)
    setInputText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      throttledSend()
    }
  }

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleRate = (id: string, rating: 'up' | 'down') => {
    setRatedMessages((prev) => ({ ...prev, [id]: rating }))
  }

  if (!isOpen) return null

  return (
    <div
      className="ask-samvidhan-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Ask Samvidhan AI Assistant"
    >
      <div
        className={`ask-samvidhan-panel samvidhan-chat ${isExpanded ? 'is-expanded-720' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Thin Gold Gradient Line at Top Edge */}
        <div className="chat-top-gold-gradient-line" aria-hidden="true" />

        {/* Faint Plume Watermark at 3-4% Opacity */}
        <div className="chat-panel-barb-bg" aria-hidden="true" />

        {/* 1. Header: Emblem + Title + Subtitle + Action Buttons */}
        <header className="ask-modal-header">
          <div className="ask-header-brand">
            <div className="ask-feather-avatar-disc" title="Fluid Dual Plume">
              <FeatherAvatar size={30} mode="dark" />
            </div>
            <div className="ask-header-titles">
              <div className="ask-title-row">
                <h2 className="ask-header-title">Ask Samvidhan</h2>
              </div>
              <span className="ask-header-subtitle">Your simple guide to Indian law</span>
              <span className="ask-disclaimer-sub">For learning only. This is not legal advice.</span>
            </div>
          </div>

          <div className="ask-header-actions">
            {/* New Chat Button */}
            <button
              type="button"
              className="ask-action-icon-btn"
              onClick={clearChat}
              title="Start a new conversation"
              aria-label="New chat"
            >
              <Plus size={17} aria-hidden="true" />
            </button>

            {/* Expand / Collapse Button (420px <-> 720px) */}
            <button
              type="button"
              className="ask-action-icon-btn desktop-only"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Collapse width to 420px' : 'Expand width to 720px'}
              aria-label={isExpanded ? 'Collapse panel' : 'Expand panel'}
            >
              {isExpanded ? <Minimize2 size={16} aria-hidden="true" /> : <Maximize2 size={16} aria-hidden="true" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              className="ask-action-icon-btn close-btn"
              onClick={onClose}
              title="Close assistant"
              aria-label="Close assistant"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* 2. Messages & Empty State Scroll Area */}
        <div
          ref={scrollAreaRef}
          className="ask-modal-scroll"
          onScroll={handleScroll}
          tabIndex={0}
          role="region"
          aria-label="Chat messages"
        >
          {messages.length === 0 ? (
            /* Empty State: Emblem + Greeting + 2-Column Suggestion Grid */
            <div className="ask-empty-state">
              <div className="empty-state-plume-wrap">
                <FeatherMark size={84} showEyeShimmer={true} />
              </div>

              <h3 className="empty-state-greeting">What would you like to know?</h3>
              <p className="empty-state-desc">
                Ask about your rights in simple words. Our guide is inspired by the peacock, India&apos;s national bird.
              </p>

              <div className="suggested-chips-2col-grid">
                {defaultSuggestedChips.map((chipText) => (
                  <button
                    key={chipText}
                    type="button"
                    className="suggested-2col-chip"
                    onClick={() => handleSend(chipText)}
                  >
                    <span>{chipText}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Message Stream List */
            <div className="ask-messages-list">
              {messages.map((msg) => {
                const isUser = msg.role === 'user'

                return (
                  <div
                    key={msg.id}
                    className={`ask-message-row ${isUser ? 'msg-user-row' : 'msg-ai-row'}`}
                  >
                    {!isUser && (
                      <div className="ask-ai-msg-avatar" aria-hidden="true">
                        <FeatherAvatar size={24} mode="dark" />
                      </div>
                    )}

                    <div className="ask-bubble-container">
                      <div className={`ask-message-bubble ${isUser ? 'user-bubble' : 'ai-bubble'}`}>
                        {isUser ? (
                          <p className="user-msg-text">{msg.content}</p>
                        ) : (
                          <div className="ai-markdown-wrap">
                            <StreamingMarkdown content={msg.content} />

                            {/* Floating Feather Pen glides ahead while this message streams */}
                            {msg.isStreaming && <FeatherPen isThinking={false} />}
                          </div>
                        )}
                      </div>

                      {/* AI Response Footer: Copy, Thumbs, Citations */}
                      {!isUser && !msg.isStreaming && (
                        <div className="ask-msg-action-bar">
                          <button
                            type="button"
                            className="msg-action-btn"
                            onClick={() => handleCopy(msg.id, msg.content)}
                            title="Copy answer to clipboard"
                          >
                            {copiedId === msg.id ? (
                              <Check size={13} className="text-emerald" />
                            ) : (
                              <Copy size={13} />
                            )}
                            <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                          </button>

                          <button
                            type="button"
                            className="msg-action-btn"
                            onClick={() => handleSend(messages[messages.length - 2]?.content || 'Explain further')}
                            title="Regenerate response"
                          >
                            <RotateCcw size={13} />
                            <span>Retry</span>
                          </button>

                          <div className="feedback-thumbs">
                            <button
                              type="button"
                              className={`thumb-btn ${ratedMessages[msg.id] === 'up' ? 'is-active' : ''}`}
                              onClick={() => handleRate(msg.id, 'up')}
                              aria-label="Helpful"
                              title="Helpful"
                            >
                              <ThumbsUp size={13} />
                            </button>
                            <button
                              type="button"
                              className={`thumb-btn ${ratedMessages[msg.id] === 'down' ? 'is-active' : ''}`}
                              onClick={() => handleRate(msg.id, 'down')}
                              aria-label="Not helpful"
                              title="Not helpful"
                            >
                              <ThumbsDown size={13} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Pattern 2: AI Answer Shimmer Loading State with Mor reading */}
              {isGenerating && messages[messages.length - 1]?.role === 'user' && (
                <div style={{ padding: '0.65rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Mor mood="reading" size={36} decorative />
                  <div style={{ flex: 1 }}>
                    <AiTypingShimmer />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Jump to Latest Floating Pill */}
        {showScrollBottom && (
          <button
            type="button"
            className="jump-to-latest-pill"
            onClick={handleJumpToBottom}
            aria-label="Scroll to newest messages"
          >
            <ArrowDown size={14} aria-hidden="true" />
            <span>Jump to latest</span>
          </button>
        )}

        {/* 3. Input Form Area */}
        <footer className="ask-modal-footer">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#94A3B8' }}>
              <span>Daily questions: <strong>{usage.used}/{usage.limit}</strong></span>
              {tier === 'free' && (
                <button
                  type="button"
                  onClick={() => setProModalOpen(true)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--gold)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                  }}
                >
                  Upgrade to Pro
                </button>
              )}
            </div>
            <AutosaveStatusBadge status={autosaveStatus} />
          </div>
          <form
            className="ask-input-form"
            onSubmit={(e) => {
              e.preventDefault()
              throttledSend()
            }}
          >
            <div style={{ flex: 1 }}>
              <AutoGrowTextarea
                label=""
                value={inputText}
                onChange={setInputText}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your rights or Indian law in simple words..."
                maxRows={5}
              />
            </div>

            {isGenerating ? (
              <button
                type="button"
                className="ask-send-btn stop-btn"
                onClick={stopGeneration}
                title="Stop streaming response"
                aria-label="Stop response"
              >
                <Square size={16} fill="currentColor" />
              </button>
            ) : (
              <button
                type="submit"
                className="ask-send-btn"
                disabled={!inputText.trim() || isSendThrottled}
                title="Send question"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            )}
          </form>
        </footer>
      </div>

      <ProGateModal
        isOpen={proModalOpen}
        onClose={() => setProModalOpen(false)}
        featureName="Unlimited Ask Samvidhan AI"
      />
    </div>
  )
}
