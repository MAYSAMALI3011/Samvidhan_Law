import { useState, useRef, useEffect } from 'react'
import { BookOpen, CheckSquare, MessageSquare, Flame, Sparkles, Award } from 'lucide-react'

export function HowItWorksSteps() {
  const [isInView, setIsInView] = useState(false)
  const [animatedXp, setAnimatedXp] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // XP Counter animation when section becomes visible
  useEffect(() => {
    if (!isInView) return
    let current = 0
    const target = 180
    const step = 6
    const timer = setInterval(() => {
      current += step
      if (current >= target) {
        setAnimatedXp(target)
        clearInterval(timer)
      } else {
        setAnimatedXp(current)
      }
    }, 25)

    return () => clearInterval(timer)
  }, [isInView])

  const steps = [
    {
      num: '01',
      icon: BookOpen,
      title: 'Learn',
      desc: 'Digest bite-sized statutory lessons in plain English, paired with citizen case studies and clear key takeaways.',
    },
    {
      num: '02',
      icon: CheckSquare,
      title: 'Practice',
      desc: 'Verify your comprehension with scenario quizzes testing real procedures (RTI, FIR, arrest rights, consumer court).',
    },
    {
      num: '03',
      icon: MessageSquare,
      title: 'Ask',
      desc: 'Query Ask Samvidhan anytime for citation-backed explanations referencing official Acts and Court rulings.',
    },
    {
      num: '04',
      icon: Flame,
      title: 'Track Progress',
      desc: 'Build a durable civic habit: earn XP, maintain streaks, and celebrate constitutional literacy milestones.',
    },
  ]

  return (
    <section
      ref={containerRef}
      className="how-it-works-section container"
      aria-labelledby="how-it-works-title"
      style={{ margin: '3.5rem auto' }}
    >
      <header className="section-head" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span className="section-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <Sparkles size={13} className="text-gold" aria-hidden="true" />
          Pedagogical Framework
        </span>
        <h2 id="how-it-works-title" className="section-title">
          How learning on Samvidhan works
        </h2>
        <p className="section-desc" style={{ maxWidth: '38rem', margin: '0 auto' }}>
          We deconstruct dense legal codes into structured, easy-to-digest modules designed for everyday citizens.
        </p>
      </header>

      {/* 4 Steps Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        {steps.map((st, idx) => {
          const Icon = st.icon
          return (
            <article
              key={st.num}
              className="samvidhan-glow-card"
              style={{
                padding: '1.5rem',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                opacity: isInView ? 1 : 0,
                transform: isInView ? 'translateY(0)' : 'translateY(16px)',
                transition: `opacity 0.4s ease-out ${idx * 100}ms, transform 0.4s var(--ease-out) ${idx * 100}ms`,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.4rem', fontFamily: 'var(--font-serif)', fontWeight: 700, color: 'var(--gold, #dfba73)' }}>
                    {st.num}
                  </span>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: 'rgba(176, 141, 87, 0.12)',
                      border: '1px solid rgba(176, 141, 87, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--gold, #dfba73)',
                    }}
                  >
                    <Icon size={18} aria-hidden="true" />
                  </div>
                </div>

                <h3 style={{ fontSize: '1.15rem', margin: '0 0 0.5rem', fontWeight: 600 }}>
                  {st.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                  {st.desc}
                </p>
              </div>
            </article>
          )
        })}
      </div>

      {/* Animated XP & Streak Progress Ring Demo */}
      <div
        className="samvidhan-glow-card"
        style={{
          padding: '1.25rem 1.75rem',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          maxWidth: '650px',
          margin: '0 auto',
          background: 'rgba(176, 141, 87, 0.06)',
          border: '1px dashed rgba(176, 141, 87, 0.4)',
        }}
        aria-label="Example civic habit tracker"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Animated SVG Ring */}
          <div style={{ position: 'relative', width: '56px', height: '56px' }}>
            <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="28"
                cy="28"
                r="22"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="5"
                fill="none"
              />
              <circle
                cx="28"
                cy="28"
                r="22"
                stroke="var(--gold, #dfba73)"
                strokeWidth="5"
                strokeDasharray="138"
                strokeDashoffset={138 - (138 * Math.min(animatedXp, 180)) / 200}
                strokeLinecap="round"
                fill="none"
                style={{ transition: 'stroke-dashoffset 0.1s linear' }}
              />
            </svg>
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gold, #dfba73)',
              }}
            >
              <Award size={18} aria-hidden="true" />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <strong style={{ fontSize: '1.15rem' }}>+{animatedXp} Civic XP</strong>
              <span className="pill pill-gold" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                EXAMPLE
              </span>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              5-Day Streak Active • Article 21 Mastered
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Flame size={20} className="text-gold" aria-hidden="true" />
          <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Daily Goal: 30 XP / day</span>
        </div>
      </div>
    </section>
  )
}
