import { useState, useId } from 'react'
import { Clock, ChevronDown, ExternalLink, AlertTriangle, ShieldCheck } from 'lucide-react'
import type { LawHistory, LawChangeKind } from '../../../types/index.ts'
import { isOfficialSourceUrl } from '../../../utils/officialSource.ts'
import {
  formatLawDate,
  sortEntriesNewestFirst,
  summarizeHistory,
  visibleEntries,
} from '../../../utils/lawHistory.ts'
import './law-history.css'

export interface LawHistoryTimelineProps {
  history?: LawHistory
  defaultOpen?: boolean
  className?: string
}

function getKindLabel(kind: LawChangeKind): string {
  switch (kind) {
    case 'original':
      return 'Original Enactment'
    case 'amended':
      return 'Amendment'
    case 'inserted':
      return 'Inserted'
    case 'omitted':
      return 'Omitted'
    case 'replaced':
      return 'Replaced'
    case 'proposed':
      return 'Proposed Bill'
    default:
      return kind
  }
}

export function LawHistoryTimeline({
  history,
  defaultOpen = false,
  className = '',
}: LawHistoryTimelineProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const uniqueId = useId()
  const contentId = `law-history-${uniqueId}`

  if (!history) {
    return null
  }

  const entries = visibleEntries(history)
  const hasEntries = entries.length > 0

  // If there are no entries, but it's verified in force as originally enacted:
  if (!hasEntries) {
    if (history.currentStatus === 'in_force' && history.lastVerifiedOn) {
      return (
        <div className={`law-history-card ${className}`}>
          <div className="law-history-trigger" style={{ cursor: 'default' }}>
            <div className="law-history-trigger-left">
              <span className="law-history-title">
                <Clock size={16} aria-hidden="true" />
                Law History
              </span>
              <span className="law-history-summary-chip">
                In force as originally enacted
              </span>
              <span className="law-history-verified-label">
                Last verified {formatLawDate(history.lastVerifiedOn)}
              </span>
            </div>
            <ShieldCheck size={16} className="text-muted" aria-label="Verified authentic" />
          </div>
        </div>
      )
    }
    return null
  }

  const sortedEntries = sortEntriesNewestFirst(entries)
  const summaryLabel = summarizeHistory(history)

  return (
    <div className={`law-history-card ${isOpen ? 'is-open' : ''} ${className}`}>
      <button
        type="button"
        className="law-history-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <div className="law-history-trigger-left">
          <span className="law-history-title">
            <Clock size={16} aria-hidden="true" />
            Law History
          </span>
          <span className="law-history-summary-chip">{summaryLabel}</span>
          {history.lastVerifiedOn && (
            <span className="law-history-verified-label">
              Last verified {formatLawDate(history.lastVerifiedOn)}
            </span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`law-history-chevron ${isOpen ? 'is-rotated' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div id={contentId} className="law-history-panel" role="region">
          <div className="law-history-timeline">
            {sortedEntries.map((entry) => {
              const isOfficial = isOfficialSourceUrl(entry.sourceUrl)
              const hasQuotes = Boolean(entry.oldText || entry.newText)

              return (
                <article key={entry.id} className="law-history-entry">
                  <div
                    className={`law-history-node-dot kind-${entry.kind}`}
                    aria-hidden="true"
                  />

                  <header className="law-history-entry-header">
                    <span className={`law-history-kind-badge kind-${entry.kind}`}>
                      {getKindLabel(entry.kind)}
                    </span>
                    <span className="law-history-date">
                      {formatLawDate(entry.effectiveDate)}
                    </span>
                    {entry.isSample && (
                      <span className="law-history-sample-tag">Sample Data</span>
                    )}
                  </header>

                  {entry.isSample && (
                    <div className="law-history-sample-banner">
                      SAMPLE ENTRY: Used for layout testing only. Not real statutory text.
                    </div>
                  )}

                  <p className="law-history-what-changed">{entry.whatChanged}</p>

                  {hasQuotes && (
                    <div
                      className={`law-history-quotes-grid ${
                        entry.oldText && entry.newText ? 'has-both' : ''
                      }`}
                    >
                      {entry.oldText && (
                        <div className="law-history-quote-box is-old">
                          <div className="law-history-quote-label">Prior Wording</div>
                          <blockquote className="law-history-quote-text">
                            &ldquo;{entry.oldText}&rdquo;
                          </blockquote>
                        </div>
                      )}
                      {entry.newText && (
                        <div className="law-history-quote-box is-new">
                          <div className="law-history-quote-label">
                            {entry.kind === 'proposed' ? 'Proposed Wording' : 'Enacted Wording'}
                          </div>
                          <blockquote className="law-history-quote-text">
                            &ldquo;{entry.newText}&rdquo;
                          </blockquote>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="law-history-reason-box">
                    <span className="law-history-reason-title">Why it changed:</span>
                    <span>{entry.reason}</span>
                    {entry.reasonSource && (
                      <span className="law-history-reason-source">
                        Source: {entry.reasonSource}
                      </span>
                    )}
                  </div>

                  <div className="law-history-metadata-grid">
                    <div className="law-history-meta-item">
                      <span className="law-history-meta-label">Changed by:</span>
                      <span>{entry.changedBy}</span>
                    </div>
                    <div className="law-history-meta-item">
                      <span className="law-history-meta-label">Authority:</span>
                      <span>{entry.authority}</span>
                    </div>
                  </div>

                  <div className="law-history-source-row">
                    {isOfficial ? (
                      <a
                        href={entry.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="law-history-source-link"
                      >
                        <span>Official Source: {entry.sourceLabel}</span>
                        <ExternalLink size={12} aria-hidden="true" />
                      </a>
                    ) : (
                      <span className="law-history-source-unverified">
                        <AlertTriangle size={13} aria-hidden="true" />
                        <span>Source: {entry.sourceLabel} (External link unverified)</span>
                      </span>
                    )}
                    <span className="law-history-verified-label">
                      &bull; Verified {formatLawDate(entry.verifiedOn)}
                    </span>
                  </div>
                </article>
              )
            })}
          </div>

          <aside className="law-history-disclaimer" aria-label="Legal information disclaimer">
            <strong>Note:</strong> This is general civic information for learning, not legal
            advice. For authoritative statutory texts, gazette notifications, and court
            interpretations, refer directly to the verified official sources linked above.
          </aside>
        </div>
      )}
    </div>
  )
}
