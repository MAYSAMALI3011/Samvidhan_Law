import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Send,
  Square,
  Sparkles,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  ShieldAlert,
  Plus,
  Landmark,
} from 'lucide-react'
import { FeatherMark } from '../../components/chatbot/FeatherMark'
import { FeatherAvatar } from '../../components/chatbot/FeatherAvatar'
import { FeatherPen } from '../../components/chatbot/FeatherPen'
import { ThinkingIndicator } from '../../components/chatbot/ThinkingIndicator'
import { StreamingMarkdown } from '../../components/assistant/streaming/StreamingMarkdown'
import { useChatStream } from '../../components/assistant/streaming/useChatStream'
import { usePageMeta } from '../../hooks/usePageMeta'
import { AutoGrowTextarea } from '../../components/ui/TextFields.jsx'
import '../../components/chatbot/chatbot.tokens.css'

const suggestedQuestions = [
  'What are my constitutional rights if police detain me?',
  'How do I file an RTI application under Section 6(1)?',
  'Can police search my phone without a warrant?',
  'What does Article 21 protect under the Constitution?',
]

export function AskPage() {
  const { messages, isGenerating, sendMessage, stopGeneration, clearChat } = useChatStream()
  const [inputText, setInputText] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [ratedMessages, setRatedMessages] = useState<Record<string, 'up' | 'down'>>({})

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  usePageMeta({
    title: 'Ask Samvidhan — AI Constitutional Companion',
    description: 'Ask any question on Indian constitutional law and civic rights with instant statutory citations.',
    path: '/ask',
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isGenerating])

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
      handleSend()
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

  return (
    <div className="container ask-page-full-viewport" role="main">
      {/* 1. Top Navigation: Back to Dashboard & Title */}
      <div className="ask-page-top-nav">
        <Link to="/dashboard" className="btn btn-outline btn-sm back-to-dashboard-btn">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="ask-page-brand-badge">
          <FeatherAvatar size={20} mode="dark" />
          <span>Sovereign Civic AI</span>
        </div>
      </div>

      <div className="ask-page-card samvidhan-chat samvidhan-glow-card">
        {/* Faint barb pattern watermark */}
        <div className="chat-panel-barb-bg" aria-hidden="true" />

        {/* Header Bar */}
        <header className="ask-page-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div className="ask-feather-avatar-disc">
                <FeatherAvatar size={28} mode="dark" />
              </div>
              <div>
                <h1 className="ask-page-title">Ask Samvidhan</h1>
                <p className="ask-page-subtitle">
                  AI Constitutional Companion &bull; Powered by Statutory Law
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={clearChat}
            title="Start fresh conversation"
          >
            <Plus size={15} />
            <span>New Chat</span>
          </button>
        </header>

        {/* Disclaimer Banner */}
        <div className="ask-disclaimer-banner">
          <ShieldAlert size={18} className="text-gold" aria-hidden="true" />
          <span>
            <strong>Educational Information:</strong> Answers explain statutory principles and constitutional articles in simple words. They do not constitute formal legal advice.
          </span>
        </div>

        {/* Message Thread */}
        <div className="ask-page-messages-area">
          {messages.length === 0 ? (
            <div className="ask-empty-state">
              <div className="ask-empty-illustration">
                <FeatherMark size={96} state="drawing" mode="dark" />
              </div>
              <h3 className="ask-empty-greeting">How can I help you understand the law?</h3>
              <p className="ask-empty-desc">
                Our guide is inspired by the peacock, India's national bird. Ask questions about your constitutional safeguards, police questioning, RTI procedures, or consumer rights in simple language.
              </p>

              <div className="ask-suggested-section">
                <span className="ask-suggested-label">
                  <Sparkles size={13} className="text-gold" /> Suggested questions:
                </span>
                <div className="ask-chips-list">
                  {suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="ask-prompt-chip"
                      onClick={() => handleSend(q)}
                    >
                      <span>{q}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="ask-messages-thread">
              {messages.map((msg) => (
                <div key={msg.id} className={`ask-message-row is-${msg.role}`}>
                  {msg.role === 'assistant' && (
                    <div className="ask-msg-avatar">
                      <FeatherAvatar size={28} mode="dark" />
                    </div>
                  )}

                  <div className="ask-msg-bubble">
                    {msg.role === 'user' ? (
                      <p className="ask-user-text">{msg.content}</p>
                    ) : (
                      <div className="ask-assistant-content">
                        {msg.error ? (
                          <div className="ask-msg-error-banner" style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#f87171' }}>
                            <p style={{ margin: 0, fontSize: '0.88rem' }}>{msg.error}</p>
                          </div>
                        ) : msg.isThinking ? (
                          <ThinkingIndicator />
                        ) : (
                          <>
                            <StreamingMarkdown content={msg.content} />
                            {msg.isStreaming && <FeatherPen isWriting={true} />}
                          </>
                        )}

                        {/* Citations Row */}
                        {msg.citations && msg.citations.length > 0 && (
                          <div className="ask-citations-bar">
                            <span className="citations-label">Statutory Sources:</span>
                            <div className="citations-pills-row">
                              {msg.citations.map((cite, i) => (
                                <Link
                                  key={i}
                                  to={cite.url}
                                  className="source-citation-badge"
                                  title={cite.summary}
                                >
                                  <Landmark size={12} className="text-gold" />
                                  <span>{cite.label}</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Toolbar */}
                        {!msg.isStreaming && !msg.isThinking && (
                          <div className="ask-msg-actions-row">
                            <button
                              type="button"
                              className="ask-bubble-tool-btn"
                              onClick={() => handleCopy(msg.id, msg.content)}
                              title="Copy answer"
                            >
                              {copiedId === msg.id ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                              <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                            </button>

                            <button
                              type="button"
                              className={`ask-bubble-tool-btn ${ratedMessages[msg.id] === 'up' ? 'is-active' : ''}`}
                              onClick={() => handleRate(msg.id, 'up')}
                              title="Helpful"
                            >
                              <ThumbsUp size={14} />
                            </button>

                            <button
                              type="button"
                              className={`ask-bubble-tool-btn ${ratedMessages[msg.id] === 'down' ? 'is-active' : ''}`}
                              onClick={() => handleRate(msg.id, 'down')}
                              title="Not helpful"
                            >
                              <ThumbsDown size={14} />
                            </button>
                          </div>
                        )}

                        {/* Follow-up Chips */}
                        {!msg.isStreaming && msg.followUps && msg.followUps.length > 0 && (
                          <div className="ask-followup-chips">
                            {msg.followUps.map((fu, fIdx) => (
                              <button
                                key={fIdx}
                                type="button"
                                className="ask-followup-btn"
                                onClick={() => handleSend(fu)}
                              >
                                <Sparkles size={11} className="text-gold" />
                                <span>{fu}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="ask-page-input-container">
          <div className="ask-input-box-wrapper">
            <div style={{ flex: 1 }}>
              <AutoGrowTextarea
                label=""
                placeholder="Ask anything about rights, police, FIR, RTI, or constitutional articles..."
                value={inputText}
                onChange={setInputText}
                onKeyDown={handleKeyDown}
                maxRows={5}
              />
            </div>

            {isGenerating ? (
              <button
                type="button"
                className="ask-send-morph-btn is-stop"
                onClick={stopGeneration}
                title="Stop generation"
                aria-label="Stop response"
              >
                <Square size={14} fill="currentColor" />
              </button>
            ) : (
              <button
                type="button"
                className="ask-send-morph-btn is-send"
                onClick={() => handleSend()}
                disabled={!inputText.trim()}
                title="Send query"
                aria-label="Send query"
              >
                <Send size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
