import {
  ArrowRight,
  CheckCircle,
  Scale,
  Compass,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { HeroReveal } from '../../components/animations/HeroReveal'
import { HeroCodexCard } from '../../components/brand/HeroCodexCard'
import { Marquee } from '../../components/common/Marquee'
import { Accordion } from '../../components/common/Disclosure'
import { Reveal } from '../../components/animations/Reveal'
import { SituationsCarousel } from '../../components/cards/SituationsCarousel'
import { GuidedPathBar } from '../../components/home/GuidedPathBar'
import { InteractiveLab } from '../../components/home/InteractiveLab'
import { CourseSnapRail } from '../../components/home/CourseSnapRail'
import { ConstitutionTeaser } from '../../components/home/ConstitutionTeaser'
import { AskPreviewCard } from '../../components/home/AskPreviewCard'
import { PeacockTour } from '../../components/mascot/PeacockTour'
import { startPeacockTour } from '../../components/mascot/peacockTourEvents'
import { faqs } from '../../data/mock/faqs'
import { usePageMeta } from '../../hooks/usePageMeta'

export function HomePage() {
  usePageMeta({
    title: 'Samvidhan — Learn the Constitution & Practical Citizen Rights',
    description:
      'Learn the Constitution of India and your everyday rights in simple, clear English with verified legal sources.',
    path: '/',
  })

  const topFaqs = faqs.slice(0, 5)

  return (
    <div className="home-page-container">
      {/* SECTION 1: HERO (UNCLUTTERED HEADLINE, 2 CLEAR CTAs & AMBEDKAR QUOTE CARD) */}
      <section className="home-hero">
        <div className="container hero-grid">
          <HeroReveal delay={0.1} className="hero-content">
            <div className="hero-eyebrow-wrapper">
              <span className="hero-eyebrow">
                <span className="hero-eyebrow-dot" aria-hidden="true" />
                LEARN YOUR RIGHTS
              </span>
            </div>

            <h1 className="hero-title">
              Know your rights. <span className="hero-title-italic">Understand the law.</span>
            </h1>

            <p className="hero-subtitle">
              An easy, step-by-step way to learn the Constitution of India, your everyday citizen rights, and what to do when you need the law.
            </p>

            <div className="hero-cta-group" id="hero-cta-buttons">
              <Link to="/learn/foundations-of-the-republic/preamble-we-the-people" className="btn btn-primary hero-primary-btn">
                <span>Start a free lesson</span>
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <button
                type="button"
                className="btn btn-secondary hero-secondary-btn"
                onClick={startPeacockTour}
                title="Take a 1-minute guided tour with Mor"
              >
                <Compass size={16} className="text-gold" aria-hidden="true" />
                <span>Take 1-Min Tour with Mor</span>
              </button>
            </div>

            <div className="hero-trust-row" aria-label="Key platform assurances">
              <div className="hero-trust-item">
                <CheckCircle size={16} className="hero-trust-icon" aria-hidden="true" />
                <span>Step-by-step lessons</span>
              </div>
              <div className="hero-trust-item">
                <CheckCircle size={16} className="hero-trust-icon" aria-hidden="true" />
                <span>Simple English for everyone</span>
              </div>
              <div className="hero-trust-item">
                <CheckCircle size={16} className="hero-trust-icon" aria-hidden="true" />
                <span>100% free for all citizens</span>
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

      {/* SECTION 2: GUIDED 3-STEP JOURNEY (CLEAR, FIXED PROGRESSION) */}
      <GuidedPathBar />

      {/* SECTION 3: TAP-TO-TRY INTERACTIVE CITIZEN LAB (Step 2 Practice) */}
      <InteractiveLab />

      {/* SECTION 4: SITUATION PLAYBOOKS (Step 3 Real-Life Encounters) */}
      <section
        id="situations-section"
        className="situations-section"
        aria-labelledby="situations-heading"
        style={{ margin: '3.5rem auto' }}
      >
        <div className="container">
          <header className="section-head" style={{ marginBottom: '1.75rem' }}>
            <span className="section-eyebrow">
              <Scale size={14} className="eyebrow-icon text-gold" aria-hidden="true" />
              Real-Life Help
            </span>
            <h2 id="situations-heading" className="section-title">
              Start with your situation
            </h2>
            <p className="section-desc">
              Find quick answers for daily life. Learn how the law protects you when filing a police complaint, answering police questions, or using your rights.
            </p>
          </header>

          <SituationsCarousel />
        </div>
      </section>

      {/* SECTION 5: SMART LEGAL HELPER (ASK SAMVIDHAN PREVIEW) */}
      <AskPreviewCard />

      {/* SECTION 6: CONSTITUTION EXPLORER TEASER */}
      <ConstitutionTeaser />

      {/* SECTION 7: FULL COURSE CURRICULUM RAIL */}
      <CourseSnapRail />

      {/* SECTION 8: FREQUENTLY ASKED QUESTIONS */}
      <section className="faq-section" aria-labelledby="faq-heading" style={{ margin: '3.5rem auto' }}>
        <div className="container">
          <header className="section-head" style={{ marginBottom: '1.75rem' }}>
            <span className="section-eyebrow">Frequently Asked Questions</span>
            <h2 id="faq-heading" className="section-title">
              Clear answers to common questions
            </h2>
            <p className="section-desc">
              Everything you need to know about learning on Samvidhan, who it is for, and how our legal lessons work.
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
              <span>Free Education &bull; Not Legal Advice</span>
            </div>

            <h2 id="cta-band-heading" className="cta-band-title">
              Learn the law that protects you.
            </h2>
            <p className="cta-band-desc">
              When you know your rights, you can stand up for yourself with confidence. Start your first free lesson today.
            </p>
            <div className="cta-band-btn-row">
              <Link to="/learn" className="btn btn-primary cta-band-btn">
                <span>Start Learning for Free</span>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PEACOCK GUIDED TOUR WALKTHROUGH */}
      <PeacockTour />
    </div>
  )
}
