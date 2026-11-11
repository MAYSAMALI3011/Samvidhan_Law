import { useState } from 'react'
import { Sparkles, Flag, AlertCircle, CheckCircle2 } from 'lucide-react'
import { MorMascot } from '../../mascot/MorMascot'
import { ListenButton } from './ListenButton'
import { SimplifyButton } from './SimplifyButton'
import { KeyWordChip } from './KeyWordChip'
import { ExamplePanel } from './ExamplePanel'
import { OfficialTextAccordion } from './OfficialTextAccordion'
import { LawHistoryTimeline } from './LawHistoryTimeline'
import { FlipCard } from './FlipCard'
import { RememberBox } from './RememberBox'
import type { InteractiveLessonCard, ScenarioChoice } from '../../../types'

export interface LessonCardStageProps {
  card: InteractiveLessonCard
  cardIndex: number
  totalCards: number
  articleCitation: string
  className?: string
}

export function LessonCardStage({
  card,
  cardIndex,
  totalCards,
  articleCitation,
  className = '',
}: LessonCardStageProps) {
  const [isSimplified, setIsSimplified] = useState(false)
  const [selectedScenario, setSelectedScenario] = useState<ScenarioChoice | null>(null)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportSubmitted, setReportSubmitted] = useState(false)

  const summaryToDisplay =
    isSimplified && card.simplifiedSummary ? card.simplifiedSummary : card.summary

  return (
    <article className={`lesson-card-stage ${className}`} aria-labelledby="lesson-card-title">
      <div className="card-inner-surface">
        {/* Top Header Pill & Utility Buttons */}
        <div className="card-top-header">
          <div className="card-kicker-pill">
            <Sparkles size={13} className="text-gold" aria-hidden="true" />
            <span className="kicker-label">{card.kicker || 'CONSTITUTIONAL CITIZEN SAFEGUARD'}</span>
          </div>

          <div className="card-utility-group">
            <ListenButton textToRead={summaryToDisplay} />
            {card.simplifiedSummary && (
              <SimplifyButton
                isSimplified={isSimplified}
                onToggle={() => setIsSimplified((prev) => !prev)}
              />
            )}
          </div>
        </div>

        {/* Title Row with Framed Mascot Badge */}
        <div className="card-title-row">
          <div className="title-text-col">
            <h1 id="lesson-card-title" className="card-title">
              {card.title}
            </h1>
            <span className="card-article-subtag">
              Constitutional Basis: {card.officialArticleNumber || articleCitation}
            </span>
          </div>

          <div className="framed-mascot-badge" title="Mor - Your Constitutional Guide">
            <div className="mascot-badge-ring">
              <MorMascot
                mood={cardIndex === 0 ? 'waving' : cardIndex === totalCards - 1 ? 'celebrating' : 'reading'}
                size={64}
              />
            </div>
            <span className="mascot-guide-tag">Guide Mor</span>
          </div>
        </div>

        {/* Plain Language Explanation Box */}
        <div className="card-explanation-section">
          <p className="card-summary-paragraph">{summaryToDisplay}</p>

          {/* Key Terms Chips */}
          {card.glossaryTerms && card.glossaryTerms.length > 0 && (
            <div className="key-terms-section">
              <span className="key-terms-header">Explore Key Terms:</span>
              <div className="key-terms-row">
                {card.glossaryTerms.map((termItem) => (
                  <KeyWordChip
                    key={termItem.term}
                    term={termItem.term}
                    definition={termItem.definition}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Everyday Citizen Example */}
        {card.citizenExample && (
          <ExamplePanel example={card.citizenExample} />
        )}

        {/* Official Statutory Text Drawer */}
        {card.officialArticleText && (
          <OfficialTextAccordion
            articleNumber={card.officialArticleNumber || articleCitation}
            articleText={card.officialArticleText}
            landmarkCase={card.landmarkCase}
          />
        )}

        {/* Law History Timeline */}
        {card.lawHistory && (
          <LawHistoryTimeline history={card.lawHistory} />
        )}

        {/* Did You Know? Flip Card */}
        {card.didYouKnow && (
          <FlipCard
            prompt={card.didYouKnow.front}
            reveal={card.didYouKnow.back}
          />
        )}

        {/* Scenario Dilemma (if card includes one) */}
        {card.scenario && (
          <section className="card-scenario-section" aria-label="Constitutional dilemma scenario">
            <div className="scenario-badge">
              <AlertCircle size={14} className="text-gold" aria-hidden="true" />
              <span>CIVIC DILEMMA: WHAT WOULD YOU DO?</span>
            </div>
            <p className="scenario-prompt">{card.scenario.prompt}</p>

            <div className="scenario-options-grid">
              {card.scenario.choices.map((choice) => {
                const isSelected = selectedScenario?.id === choice.id
                return (
                  <button
                    key={choice.id}
                    type="button"
                    className={`scenario-option-btn ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => setSelectedScenario(choice)}
                  >
                    <span className="option-letter">{choice.id.toUpperCase()}</span>
                    <span className="option-text">{choice.text}</span>
                  </button>
                )
              })}
            </div>

            {selectedScenario && (
              <div
                className={`scenario-feedback-card ${
                  selectedScenario.isConstitutional ? 'is-correct' : 'is-incorrect'
                }`}
              >
                <div className="feedback-header">
                  {selectedScenario.isConstitutional ? (
                    <CheckCircle2 size={16} className="text-emerald" aria-hidden="true" />
                  ) : (
                    <AlertCircle size={16} className="text-coral" aria-hidden="true" />
                  )}
                  <strong>
                    {selectedScenario.isConstitutional
                      ? 'Constitutional Understanding'
                      : 'Common Legal Misunderstanding'}
                  </strong>
                </div>
                <p className="feedback-body">{selectedScenario.outcome}</p>
                <span className="feedback-ref">Statutory Reference: {selectedScenario.articleRef}</span>
              </div>
            )}
          </section>
        )}

        {/* Remember / Key Takeaway Box */}
        {card.takeaway && (
          <RememberBox
            takeaway={card.takeaway}
            source={card.officialArticleNumber || articleCitation}
          />
        )}

        {/* Card Footer: Metadata, Source, Mistake Report, and Legal Disclaimer */}
        <footer className="card-meta-footer">
          <div className="footer-meta-left">
            <span className="source-citation">
              Verified Statutory Citation: <strong>{card.officialArticleNumber || articleCitation}</strong>
            </span>
            <button
              type="button"
              className="report-mistake-link"
              onClick={() => {
                setReportModalOpen(true)
                setReportSubmitted(false)
              }}
              title="Report an inaccuracy or suggest an improvement"
            >
              <Flag size={12} aria-hidden="true" />
              <span>Report a mistake</span>
            </button>
          </div>

          <p className="legal-disclaimer-note">
            Educational information for constitutional literacy only. Not legal advice.
          </p>
        </footer>
      </div>

      {/* Report Mistake Modal */}
      {reportModalOpen && (
        <div className="report-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="report-modal-title">
          <div className="report-modal-box">
            <h3 id="report-modal-title">Report Content Feedback</h3>
            {reportSubmitted ? (
              <div className="report-success">
                <CheckCircle2 size={24} className="text-emerald" />
                <p>Thank you! Your feedback has been queued for constitutional reviewer verification.</p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setReportModalOpen(false)}
                >
                  Close
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setReportSubmitted(true)
                }}
              >
                <p className="report-intro">
                  Notice an issue with <em>{card.title}</em>? Our legal team verifies all citations.
                </p>
                <textarea
                  className="report-textarea"
                  rows={3}
                  required
                  placeholder="Describe the typo, factual dispute, or broken example..."
                />
                <div className="report-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setReportModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit for Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </article>
  )
}
