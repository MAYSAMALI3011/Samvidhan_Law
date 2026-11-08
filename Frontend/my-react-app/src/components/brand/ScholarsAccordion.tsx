import { useState } from 'react'
import { Landmark, Scale, Award, ArrowUpRight } from 'lucide-react'
import { advisors } from '../../data/mock/testimonials'

const scholarImages = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80',
]

export function ScholarsAccordion() {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <div className="scholars-accordion-container" aria-label="Legal Scholars Accordion">
      {advisors.map((adv, idx) => {
        const isActive = activeIndex === idx
        const bgImg = scholarImages[idx % scholarImages.length]

        return (
          <div
            key={adv.id}
            className={`scholar-accordion-panel ${isActive ? 'is-active' : ''}`}
            onMouseEnter={() => setActiveIndex(idx)}
            onClick={() => setActiveIndex(idx)}
            style={{
              backgroundImage: `linear-gradient(to top, rgba(10, 22, 40, 0.95) 0%, rgba(10, 22, 40, 0.6) 45%, rgba(10, 22, 40, 0.3) 100%), url(${bgImg})`,
            }}
            role="region"
            aria-expanded={isActive}
            aria-label={adv.name}
          >
            {/* Top Indicator */}
            <div className="scholar-top-badge">
              <span className="scholar-number">0{idx + 1}</span>
              <div className="scholar-icon-pill">
                {idx === 0 ? <Scale size={15} /> : idx === 1 ? <Landmark size={15} /> : <Award size={15} />}
              </div>
            </div>

            {/* Vertical Name (visible when inactive on desktop) */}
            <div className="scholar-collapsed-title" aria-hidden={isActive}>
              <span>{adv.name}</span>
            </div>

            {/* Expanded Content View */}
            <div className="scholar-expanded-content" aria-hidden={!isActive}>
              <div className="scholar-badge-tag">{adv.affiliation}</div>
              <h4 className="scholar-full-name">{adv.name}</h4>
              <div className="scholar-role-text">{adv.role}</div>
              <p className="scholar-focus-text">{adv.focus}</p>

              <div className="scholar-verified-row">
                <span className="scholar-verified-pill">Peer Reviewer</span>
                <span className="scholar-arrow-circle" aria-hidden="true">
                  <ArrowUpRight size={14} />
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
