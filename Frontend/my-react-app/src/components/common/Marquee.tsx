import { Landmark, Scale, BookCheck, ShieldCheck, Award } from 'lucide-react'

const authorities = [
  { name: 'Supreme Court of India', icon: Scale, detail: 'Landmark Precedents & Writs' },
  { name: 'The Gazette of India', icon: BookCheck, detail: 'Verbatim Statutory Codes' },
  { name: 'Constituent Assembly', icon: Landmark, detail: 'Debates & Original Intent' },
  { name: 'High Courts of India', icon: Award, detail: 'Article 226 Jurisdictions' },
  { name: 'Central Acts & Ordinances', icon: ShieldCheck, detail: 'Criminal, Civil & Digital Laws' },
]

export function Marquee() {
  return (
    <div className="trust-marquee-wrapper" aria-label="Legal authorities and verified sources">
      <div className="trust-marquee-track">
        {/* Double array for seamless infinite marquee scroll */}
        {[...authorities, ...authorities].map((item, idx) => {
          const Icon = item.icon
          return (
            <div key={idx} className="trust-marquee-item">
              <Icon size={16} className="trust-marquee-icon" aria-hidden="true" />
              <div className="trust-marquee-text">
                <span className="trust-marquee-name">{item.name}</span>
                <span className="trust-marquee-detail">{item.detail}</span>
              </div>
              <svg className="trust-marquee-dot" width="6" height="6" viewBox="0 0 6 6" fill="currentColor" aria-hidden="true">
                <circle cx="3" cy="3" r="2.5" />
              </svg>
            </div>
          )
        })}
      </div>
    </div>
  )
}
