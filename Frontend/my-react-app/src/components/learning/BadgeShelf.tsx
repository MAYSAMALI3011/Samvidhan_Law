import { useState } from 'react'
import {
  Lock,
  X,
  CheckCircle2,
  Award,
  Flame,
  Shield,
  Landmark,
  Sparkles,
  FileText,
  type LucideIcon,
} from 'lucide-react'
import { useAppState } from '../../context/useAppState'

export interface BadgeItem {
  id: string
  title: string
  kicker: string
  desc: string
  Icon: LucideIcon
}

const allBadges: BadgeItem[] = [
  {
    id: 'first-step',
    title: 'First Step',
    kicker: 'CIVIC MILESTONE',
    desc: 'Completed your very first constitutional lesson on Samvidhan.',
    Icon: Award,
  },
  {
    id: 'streak-3',
    title: 'Flame Keeper',
    kicker: 'STREAK MILESTONE',
    desc: 'Maintained a 3-day active learning streak of civic education.',
    Icon: Flame,
  },
  {
    id: 'article-21-master',
    title: 'Liberty Defender',
    kicker: 'LEGAL MASTERY',
    desc: 'Mastered Article 21 and the Maneka Gandhi fair procedure doctrine.',
    Icon: Shield,
  },
  {
    id: 'preamble-pioneer',
    title: 'Preamble Pioneer',
    kicker: 'FOUNDATION',
    desc: 'Completed Unit 1: The Preamble & Sovereign Foundations with distinction.',
    Icon: Landmark,
  },
  {
    id: 'flawless-quiz',
    title: 'Supreme Bench',
    kicker: 'PERFECT COMPREHENSION',
    desc: 'Scored 100% on a statutory knowledge check on your first attempt.',
    Icon: Sparkles,
  },
  {
    id: 'rti-pro',
    title: 'Transparency Champion',
    kicker: 'APPLIED ACTION',
    desc: 'Learned the procedure for Section 6(1) RTI queries and first appeals.',
    Icon: FileText,
  },
]

export function BadgeShelf() {
  const { progress, playSound } = useAppState()
  const [activeBadge, setActiveBadge] = useState<BadgeItem | null>(null)

  const unlocked = progress.badges || ['first-step']

  return (
    <div className="badge-shelf-container" role="region" aria-label="Constitutional Badges">
      <div className="badge-shelf-header">
        <div className="badge-shelf-title-wrap">
          <Award size={18} className="text-gold" aria-hidden="true" />
          <h3 className="badge-shelf-heading">Badges</h3>
        </div>
        <span className="badge-shelf-counter">{unlocked.length} of {allBadges.length} Earned</span>
      </div>

      <div className="badge-shelf-grid">
        {allBadges.map((badge) => {
          const isUnlocked = unlocked.includes(badge.id)
          const BadgeIcon = badge.Icon

          return (
            <button
              key={badge.id}
              type="button"
              className={`badge-shelf-card ${isUnlocked ? 'is-unlocked' : 'is-locked'}`}
              onClick={() => {
                playSound('pop')
                setActiveBadge(badge)
              }}
              aria-label={`${badge.title} - ${isUnlocked ? 'Earned' : 'Locked'}`}
            >
              <div className="badge-icon-disc">
                {isUnlocked ? (
                  <BadgeIcon size={24} className="badge-svg-icon text-gold" aria-hidden="true" />
                ) : (
                  <Lock size={18} className="badge-locked-icon" aria-hidden="true" />
                )}
              </div>
              <strong className="badge-title">{badge.title}</strong>
              <span className="badge-status-tag">{isUnlocked ? 'Earned' : 'Locked'}</span>
            </button>
          )
        })}
      </div>

      {/* Badge Detail Modal */}
      {activeBadge && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="badge-detail-title">
          <div className="badge-modal samvidhan-glow-card">
            <button
              type="button"
              className="badge-modal-close"
              onClick={() => setActiveBadge(null)}
              aria-label="Close badge modal"
            >
              <X size={20} />
            </button>

            <div className="badge-modal-seal">
              <activeBadge.Icon size={44} className="badge-large-svg text-gold" />
            </div>

            <span className="badge-modal-kicker">{activeBadge.kicker}</span>
            <h3 id="badge-detail-title" className="badge-modal-title">{activeBadge.title}</h3>
            <p className="badge-modal-desc">{activeBadge.desc}</p>

            <div className="badge-modal-status-box">
              {unlocked.includes(activeBadge.id) ? (
                <div className="status-unlocked-row">
                  <CheckCircle2 size={18} className="text-emerald" />
                  <span>Verified Citizen Accreditation Earned</span>
                </div>
              ) : (
                <div className="status-locked-row">
                  <Lock size={16} />
                  <span>Keep practicing your daily lessons to unlock this milestone</span>
                </div>
              )}
            </div>

            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => setActiveBadge(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
