import {
  ArrowRight,
  Flame,
  BookOpen,
  CheckCircle,
  Compass,
  GraduationCap,
  Scale,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Mor } from '../../components/mascot/Mor'
import { Accordion } from '../../components/common/Disclosure'
import { CourseCard } from '../../components/learning/CourseCard'
import { HeroReveal } from '../../components/animations/HeroReveal'
import { HeroCodexCard } from '../../components/brand/HeroCodexCard'
import { StepsTimeline } from '../../components/brand/StepsTimeline'
import { Reveal } from '../../components/animations/Reveal'
import { Marquee } from '../../components/common/Marquee'
import { SituationsCarousel } from '../../components/cards/SituationsCarousel'
import { courses } from '../../data/mock/curriculum'
import { lessonsForCourse } from '../../services/catalog'
import { percent } from '../../utils/format'
import { faqs } from '../../data/mock/faqs'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useAppState } from '../../context/useAppState'

export function HomePage() {
  usePageMeta({
    title: 'Samvidhan — Learn the Constitution & Practical Citizen Rights',
    description:
      'Empowering citizens with plain-English constitutional education, practical legal guides, and verified statutory citations.',
    path: '/',
  })

  const { progress } = useAppState()
  const featuredCourses = courses.slice(0, 3)
  const topFaqs = faqs.slice(0, 5)

  return (
    <div className="home-page-container">
      {/* SECTION 1: HERO & INTERACTIVE CONSTITUTIONAL CODEX CARD */}
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

            {/* Featured Mor Mascot Guide Welcome */}
            <div className="hero-mor-badge" aria-label="Meet Mor, your constitutional guide">
              <div className="hero-mor-avatar">
                <Mor mood="wave" size={54} animate decorative />
              </div>
              <div className="hero-mor-text-wrap">
                <span className="hero-mor-label">
                  <Sparkles size={12} className="text-gold" aria-hidden="true" />
                  MEET MOR &bull; CONSTITUTIONAL GUIDE
                </span>
                <p className="hero-mor-tagline">
                  &ldquo;Namaste! I explain laws in bite-sized lessons with real citizen examples.&rdquo;
                </p>
              </div>
            </div>

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

          {/* Dr. Ambedkar Rotating Quote Card (Quotes only, no tabs!) */}
          <HeroReveal delay={0.25} className="hero-codex-col">
            <HeroCodexCard />
          </HeroReveal>
        </div>

        {/* Continuous Legal Authority Marquee */}
        <div className="hero-marquee-band">
          <Marquee />
        </div>
      </section>

      {/* SECTION 2: DUOLINGO-STYLE INTERACTIVE LEARNING PATH */}
            {/* SECTION 2: HOW CITIZEN MASTERY WORKS (Conversion section pointing to /dashboard) */}
      <section className="learning-overview-banner" aria-labelledby="hub-overview-heading">
        <div className="container">
          <div className="learning-hub-preview-card">
            <div className="hub-preview-left">
              <span className="section-eyebrow">
                <Compass size={14} className="eyebrow-icon text-gold" aria-hidden="true" />
                Dignified Civic Mastery
              </span>
              <h2 id="hub-overview-heading" className="section-title">
                Learn your rights in 3 minutes a day
              </h2>
              <p className="section-desc">
                Structured like a habit-forming civic companion: bite-sized statutory lessons, real-world citizen examples, and zero legalese. Open your learning dashboard to check your score, track your streak, and start today's lesson.
              </p>
              <div className="hub-preview-actions">
                <Link to="/dashboard" className="btn btn-primary">
                  <span>Go to Learning Dashboard</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link to="/learn" className="btn btn-secondary">
                  <span>Explore Curriculum</span>
                </Link>
              </div>
            </div>

            <div className="hub-preview-right">
              <div className="hub-feature-grid">
                <div className="hub-feature-pill">
                  <div className="hub-feature-icon-wrap">
                    <BookOpen size={18} className="text-gold" />
                  </div>
                  <div>
                    <strong>Topic Explained First</strong>
                    <span>Clear constitutional principles with real-life citizen examples</span>
                  </div>
                </div>

                <div className="hub-feature-pill">
                  <div className="hub-feature-icon-wrap">
                    <Sparkles size={18} className="text-gold" />
                  </div>
                  <div>
                    <strong>Instant Knowledge Checks</strong>
                    <span>Interactive quizzes testing what was just taught</span>
                  </div>
                </div>

                <div className="hub-feature-pill">
                  <div className="hub-feature-icon-wrap">
                    <Flame size={18} className="text-gold" />
                  </div>
                  <div>
                    <strong>Streaks &amp; Civic XP</strong>
                    <span>Build legal confidence with positive reinforcement</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: START WITH YOUR SITUATION (Practical Citizen Playbooks) */}
      <section className="situations-section" aria-labelledby="situations-heading">
        <div className="container">
          <header className="section-head">
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

      {/* SECTION 5: HOW IT WORKS (Pedagogical Framework) */}
      <section className="how-it-works-section" aria-labelledby="steps-heading">
        <div className="container">
          <header className="section-head">
            <span className="section-eyebrow">Pedagogical Framework</span>
            <h2 id="steps-heading" className="section-title">
              How learning on Samvidhan works
            </h2>
            <p className="section-desc">
              We deconstruct dense legal codes into rigorous, easy-to-digest modules grounded in actual Indian court rulings and statutory provisions.
            </p>
          </header>

          <StepsTimeline />
        </div>
      </section>

      {/* SECTION 6: FEATURED CURRICULUM SYLLABUS */}
      <section className="courses-section" aria-labelledby="courses-heading">
        <div className="container">
          <header className="section-head">
            <span className="section-eyebrow">
              <GraduationCap size={14} className="eyebrow-icon text-gold" aria-hidden="true" />
              Structured Syllabus
            </span>
            <h2 id="courses-heading" className="section-title">
              Official learning tracks
            </h2>
            <p className="section-desc">
              Complete civic tracks designed for everyday citizens, students, competitive exam aspirants, and legal educators.
            </p>
          </header>

          <div className="courses-grid">
            {featuredCourses.map((course) => {
              const allLessons = lessonsForCourse(course.id)
              const completedCount = allLessons.filter((l) => progress.completedLessonIds.includes(l.id)).length
              const progPercent = percent(completedCount, allLessons.length)

              return (
                <CourseCard
                  key={course.id}
                  course={course}
                  progress={progPercent}
                />
              )
            })}
          </div>

          <div className="courses-footer-cta">
            <Link to="/learn" className="btn btn-secondary">
              <BookOpen size={17} aria-hidden="true" />
              <span>Explore all curriculum tracks</span>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 7: FREQUENTLY ASKED QUESTIONS */}
      <section className="faq-section" aria-labelledby="faq-heading">
        <div className="container">
          <header className="section-head">
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

      {/* Educational Civic Disclaimer & Closing Call to Action */}
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