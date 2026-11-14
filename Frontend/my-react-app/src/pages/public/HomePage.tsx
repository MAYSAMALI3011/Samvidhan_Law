import {
  ArrowRight,
  CheckCircle,
  Scale,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { HeroReveal } from '../../components/animations/HeroReveal'
import { HeroCodexCard } from '../../components/brand/HeroCodexCard'
import { Marquee } from '../../components/common/Marquee'
import { Accordion } from '../../components/common/Disclosure'
import { Reveal } from '../../components/animations/Reveal'
import { SituationsCarousel } from '../../components/cards/SituationsCarousel'
import { HeroMascotCompanion } from '../../components/home/HeroMascotCompanion'
import { InteractiveLab } from '../../components/home/InteractiveLab'
import { CourseSnapRail } from '../../components/home/CourseSnapRail'
import { ConstitutionTeaser } from '../../components/home/ConstitutionTeaser'
import { AskPreviewCard } from '../../components/home/AskPreviewCard'
import { HowItWorksSteps } from '../../components/home/HowItWorksSteps'
import { faqs } from '../../data/mock/faqs'
import { usePageMeta } from '../../hooks/usePageMeta'

export function HomePage() {
  usePageMeta({
    title: 'Samvidhan — Learn the Constitution & Practical Citizen Rights',
    description:
      'Empowering citizens with plain-English constitutional education, practical legal guides, and verified statutory citations.',
    path: '/',
  })

  const topFaqs = faqs.slice(0, 5)

  return (
    <div className="home-page-container">
      {/* SECTION 1: HERO WITH MOR COMPANION & CODEX QUOTE CARD */}
      <section className="home-hero">
        <div className="container hero-grid">
          <HeroReveal delay={0.1} className="hero-content">
            <div className="hero-eyebrow-wrapper">
              <span className="hero-eyebrow">
                <span className="hero-eyebrow-dot" aria-hidden="true" />
                SOVEREIGN LEGAL EDUCATION
              </span>
            </div>

            <h1 className="hero-title">
              Know your rights. <span className="hero-title-italic">Understand the law.</span>
            </h1>

            {/* Interactive Mascot Companion with Live Speech Bubble & Direct Action Chips */}
            <HeroMascotCompanion />

            <p className="hero-subtitle">
              A structured, accessible platform to master the Constitution of India, practical citizen safeguards, and everyday legal procedures with verified statutory citations.
            </p>

            <div className="hero-cta-group">
              <Link to="/learn/foundations-of-the-republic/preamble-we-the-people" className="btn btn-primary hero-primary-btn">
                <span>Start a free lesson</span>
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link to="/constitution" className="btn btn-secondary hero-secondary-btn">
                <span>Browse Constitution</span>
              </Link>
            </div>

            <div className="hero-trust-row" aria-label="Key platform assurances">
              <div className="hero-trust-item">
                <CheckCircle size={16} className="hero-trust-icon" aria-hidden="true" />
                <span>Structured legal curriculum</span>
              </div>
              <div className="hero-trust-item">
                <CheckCircle size={16} className="hero-trust-icon" aria-hidden="true" />
                <span>Plain-English citizen breakdowns</span>
              </div>
              <div className="hero-trust-item">
                <CheckCircle size={16} className="hero-trust-icon" aria-hidden="true" />
                <span>Free &amp; accessible to all</span>
              </div>
            </div>
          </HeroReveal>

          {/* Dr. Ambedkar Rotating Quote Codex Card */}
          <HeroReveal delay={0.25} className="hero-codex-col">
            <HeroCodexCard />
          </HeroReveal>
        </div>

        {/* Continuous Statutory Marquee Band */}
        <div className="hero-marquee-band">
          <Marquee />
        </div>
      </section>

      {/* SECTION 2: TAP-TO-TRY INTERACTIVE CITIZEN LAB (Flip Card & Mini-Quiz) */}
      <InteractiveLab />

      {/* SECTION 3: HOW IT WORKS (4 Animated Steps + XP Counter Demo) */}
      <HowItWorksSteps />

      {/* SECTION 4: HORIZONTAL COURSE RAIL (Coursera / Varsity Style Snap Scroll) */}
      <CourseSnapRail />

      {/* SECTION 5: SITUATION PLAYBOOKS (Everyday Encounters) */}
      <section className="situations-section" aria-labelledby="situations-heading" style={{ margin: '3.5rem auto' }}>
        <div className="container">
          <header className="section-head" style={{ marginBottom: '1.75rem' }}>
            <span className="section-eyebrow">
              <Scale size={14} className="eyebrow-icon text-gold" aria-hidden="true" />
              Practical Citizen Action
            </span>
            <h2 id="situations-heading" className="section-title">
              Start with your situation
            </h2>
            <p className="section-desc">
              Direct statutory paths for everyday encounters. Learn how Indian law protects you when filing complaints, facing police questioning, or asserting your fundamental rights.
            </p>
          </header>

          <SituationsCarousel />
        </div>
      </section>

      {/* SECTION 6: CONSTITUTION EXPLORER TEASER */}
      <ConstitutionTeaser />

      {/* SECTION 7: ASK SAMVIDHAN PREVIEW */}
      <AskPreviewCard />

      {/* SECTION 8: FREQUENTLY ASKED QUESTIONS */}
      <section className="faq-section" aria-labelledby="faq-heading" style={{ margin: '3.5rem auto' }}>
        <div className="container">
          <header className="section-head" style={{ marginBottom: '1.75rem' }}>
            <span className="section-eyebrow">Frequently Asked Questions</span>
            <h2 id="faq-heading" className="section-title">
              Clear answers to common questions
            </h2>
            <p className="section-desc">
              Everything you need to know about Samvidhan&apos;s educational platform, curriculum access, and statutory accuracy.
            </p>
          </header>

          <div className="faq-list">
            {topFaqs.map((faq, idx) => (
              <Reveal key={idx} delay={idx * 50}>
                <Accordion title={faq.q} defaultOpen={idx === 0}>
                  {faq.a}
                </Accordion>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 9: CLOSING CIVIC CTA BAND */}
      <section className="cta-band" aria-labelledby="cta-band-heading">
        <div className="container">
          <div className="cta-band-content">
            <div className="civic-disclaimer-pill">
              <Scale size={15} className="text-gold" aria-hidden="true" />
              <span>Independent Civic Education &bull; Not Legal Advice</span>
            </div>

            <h2 id="cta-band-heading" className="cta-band-title">
              Empower yourself with the law of the land.
            </h2>
            <p className="cta-band-desc">
              Knowledge of your constitutional protections is your strongest defense as a citizen. Start your first lesson today for free.
            </p>
            <div className="cta-band-btn-row">
              <Link to="/learn" className="btn btn-primary cta-band-btn">
                <span>Begin Learning Free</span>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
