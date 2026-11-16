import { Link } from 'react-router-dom'
import { MessageSquare, ArrowRight, ShieldCheck, Sparkles, BookOpen } from 'lucide-react'

export function AskPreviewCard() {
  return (
    <section
      id="ask-preview-section"
      className="ask-preview-section container"
      aria-labelledby="ask-preview-title"
      style={{ margin: '3.5rem auto' }}
    >
      <div className="ask-preview-grid-container samvidhan-glow-card">
        <div className="ask-preview-content-col">
          <span className="section-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Sparkles size={13} className="text-gold" aria-hidden="true" />
            Smart Legal Helper
          </span>
          <h2 id="ask-preview-title" className="section-title" style={{ margin: '0.35rem 0 0.65rem' }}>
            Ask Samvidhan
          </h2>
          <p className="section-desc" style={{ margin: '0 0 1.5rem', lineHeight: 1.5 }}>
            Ask any legal question in simple English. Samvidhan checks real laws, key court cases, and official guides to give you clear answers you can trust.
          </p>

          <div className="ask-preview-trust-list">
            <div className="ask-preview-trust-item">
              <ShieldCheck size={16} className="text-gold" aria-hidden="true" />
              <span>Based on real Indian laws and Constitutional articles</span>
            </div>
            <div className="ask-preview-trust-item">
              <ShieldCheck size={16} className="text-gold" aria-hidden="true" />
              <span>No confusing words — clear explanations for everyone</span>
            </div>
          </div>

          <Link to="/ask" className="btn btn-primary" style={{ display: 'inline-flex', gap: '8px' }}>
            <MessageSquare size={16} aria-hidden="true" />
            <span>Ask a Legal Question</span>
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>

        {/* Interactive Chat Simulation Card */}
        <div className="ask-preview-chat-card" aria-label="Sample interactive query preview">
          {/* User Prompt */}
          <div className="ask-preview-user-row">
            <div className="ask-preview-user-bubble">
              &ldquo;What are my rights if stopped for questioning by police?&rdquo;
            </div>
          </div>

          {/* Assistant Grounded Answer */}
          <div className="ask-preview-assistant-row">
            <div className="ask-preview-bot-avatar" aria-hidden="true">
              S
            </div>
            <div className="ask-preview-assistant-bubble">
              <p className="ask-preview-assistant-lead">
                Under Indian law, you have clear rights when stopped or questioned by police:
              </p>
              <ul className="ask-preview-bullets">
                <li>You have the right to know the reason for your arrest right away.</li>
                <li>You have the right to talk to a lawyer of your choice during questioning.</li>
                <li>Women cannot be arrested after sunset and before sunrise without special permission from a judge.</li>
              </ul>

              {/* Citations Row */}
              <div className="ask-preview-citations-row">
                <span className="pill pill-gold" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <BookOpen size={11} aria-hidden="true" /> Art. 22(1) Constitution
                </span>
                <span className="ask-preview-citation-pill">
                  Section 41D CrPC / BNSS
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
