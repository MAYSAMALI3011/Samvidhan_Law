import { useState } from 'react'
import { BookOpen, CheckCircle2, ChevronDown, ChevronUp, Scale, Sparkles, Zap } from 'lucide-react'
import { FeedbackBar } from './FeedbackBar'
import { useAppState } from '../../context/useAppState'

export function InteractiveMiniLesson() {
  const { addXp, playSound } = useAppState()
  const [showOfficialText, setShowOfficialText] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)

  const handleSelect = (optionId: string) => {
    if (feedback === 'correct') return
    setSelectedOption(optionId)
  }

  const handleCheck = () => {
    if (!selectedOption) return

    if (selectedOption === 'opt-b') {
      setFeedback('correct')
      playSound('correct')
      if (!isCompleted) {
        addXp(15)
        setIsCompleted(true)
      }
    } else {
      setFeedback('wrong')
      playSound('wrong')
    }
  }

  const handleReset = () => {
    setSelectedOption(null)
    setFeedback(null)
  }

  return (
    <div className="mini-lesson-card samvidhan-glow-card" role="region" aria-label="1-Minute Interactive Lesson">
      {/* Header Badge */}
      <div className="mini-lesson-head">
        <div className="mini-lesson-pill">
          <Sparkles size={13} className="mini-sparkle" aria-hidden="true" />
          <span>Interactive 1-Minute Micro-Lesson</span>
        </div>
        <div className="mini-lesson-reward">
          <Zap size={14} className="reward-icon" aria-hidden="true" />
          <span>+15 XP</span>
        </div>
      </div>

      <div className="mini-lesson-body">
        {/* Concept Introduction */}
        <div className="mini-concept-block">
          <div className="mini-concept-icon-wrap" aria-hidden="true">
            <Scale size={24} className="mini-concept-icon" />
          </div>
          <div>
            <span className="mini-concept-kicker">CONSTITUTION OF INDIA &bull; PART III</span>
            <h3 className="mini-concept-title">Article 21: Protection of Life and Personal Liberty</h3>
            <p className="mini-concept-text">
              Article 21 is the beating heart of Indian constitutional rights. It guarantees that{' '}
              <strong className="text-gold">&ldquo;no person shall be deprived of his life or personal liberty except according to procedure established by law.&rdquo;</strong>
            </p>
          </div>
        </div>

        {/* Expandable Official Statutory Text */}
        <div className="mini-statutory-drawer">
          <button
            type="button"
            className="mini-drawer-trigger"
            onClick={() => setShowOfficialText(!showOfficialText)}
            aria-expanded={showOfficialText}
          >
            <BookOpen size={15} aria-hidden="true" />
            <span>{showOfficialText ? 'Hide official constitutional text' : 'Read original Constitutional text'}</span>
            {showOfficialText ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {showOfficialText && (
            <div className="mini-drawer-content" role="region" aria-label="Official text of Article 21">
              <blockquote className="mini-article-quote">
                &ldquo;21. Protection of life and personal liberty.&mdash;No person shall be deprived of his life or personal liberty except according to procedure established by law.&rdquo;
              </blockquote>
              <div className="mini-drawer-cite">
                Constitution of India (1950) &bull; 7-Judge Bench Landmark: <em>Maneka Gandhi v. Union of India (1978 AIR 597)</em>
              </div>
            </div>
          )}
        </div>

        {/* Real-World Scenario Question */}
        <div className="mini-quiz-box">
          <span className="mini-quiz-prompt-label">PRACTICAL SCENARIO CHECK:</span>
          <p className="mini-quiz-question">
            An immigration officer confiscates a citizen&apos;s passport without disclosing written reasons or providing an opportunity for a hearing. Is this procedure valid under Article 21?
          </p>

          <div className="mini-options-list" role="radiogroup" aria-label="Scenario options">
            <button
              type="button"
              role="radio"
              aria-checked={selectedOption === 'opt-a'}
              className={`mini-option-btn ${selectedOption === 'opt-a' ? 'is-selected' : ''} ${feedback === 'wrong' && selectedOption === 'opt-a' ? 'is-incorrect-choice' : ''}`}
              onClick={() => handleSelect('opt-a')}
            >
              <span className="mini-opt-badge">A</span>
              <span className="mini-opt-text">Yes, government officers have unlimited discretionary power over travel documents.</span>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={selectedOption === 'opt-b'}
              className={`mini-option-btn ${selectedOption === 'opt-b' ? 'is-selected' : ''} ${feedback === 'correct' ? 'is-correct-choice' : ''}`}
              onClick={() => handleSelect('opt-b')}
            >
              <span className="mini-opt-badge">B</span>
              <span className="mini-opt-text">No. Under Maneka Gandhi (1978), any procedure depriving personal liberty must be just, fair, and reasonable, not arbitrary.</span>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={selectedOption === 'opt-c'}
              className={`mini-option-btn ${selectedOption === 'opt-c' ? 'is-selected' : ''} ${feedback === 'wrong' && selectedOption === 'opt-c' ? 'is-incorrect-choice' : ''}`}
              onClick={() => handleSelect('opt-c')}
            >
              <span className="mini-opt-badge">C</span>
              <span className="mini-opt-text">Yes, because passports are privileges granted at will, not constitutional liberties.</span>
            </button>
          </div>

          {!feedback ? (
            <div className="mini-quiz-submit-row">
              <button
                type="button"
                className="btn btn-primary mini-submit-btn"
                disabled={!selectedOption}
                onClick={handleCheck}
              >
                Check Answer
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Duolingo-style Feedback Bar */}
      <FeedbackBar
        status={feedback}
        explanation={
          feedback === 'correct'
            ? 'The Supreme Court ruled that "procedure established by law" must satisfy the principles of natural justice. Arbitrary state action is unconstitutional.'
            : 'Remember: In the 1978 Maneka Gandhi judgment, the Supreme Court ruled that pure statutory procedure is not enough — it must also be fair, just, and non-arbitrary!'
        }
        citation="Constitution of India, Art. 21 &bull; Maneka Gandhi v. Union of India (1978) 1 SCC 248"
        onContinue={feedback === 'correct' ? () => {} : handleReset}
      />

      {isCompleted && (
        <div className="mini-lesson-completed-ribbon">
          <CheckCircle2 size={16} className="ribbon-check" aria-hidden="true" />
          <span>Lesson Complete &bull; +15 XP credited to your profile</span>
        </div>
      )}
    </div>
  )
}