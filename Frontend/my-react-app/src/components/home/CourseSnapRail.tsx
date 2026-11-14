import React, { useRef, useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion, useInView } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Clock,
  ArrowRight,
  GraduationCap,
} from 'lucide-react'
import { courses } from '../../data/mock/curriculum'
import { useAppState } from '../../context/useAppState'
import { lessonsForCourse } from '../../services/catalog'
import { percent } from '../../utils/format'
import { CountUp } from '../animations/CountUp'

const HEADING_WORDS = ['Official', 'learning', 'tracks']

export function CourseSnapRail() {
  const sectionRef = useRef<HTMLElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const glowRaf = useRef<number | null>(null)
  const isDragging = useRef(false)
  const dragMoved = useRef(false)
  const dragStartX = useRef(0)
  const dragScrollLeft = useRef(0)
  const lastX = useRef(0)
  const lastTime = useRef(0)
  const velocity = useRef(0)

  const { progress } = useAppState()
  const prefersReducedMotion = useReducedMotion()
  const isSectionInView = useInView(sectionRef, { once: true, amount: 0.15 })

  // Scroll state & arrow availability
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [scrollProgress, setScrollProgress] = useState(0) // 0 to 1
  const [isSectionVisible, setIsSectionVisible] = useState(true)

  // 10. Pause drifting background glow when off screen
  useEffect(() => {
    if (!sectionRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSectionVisible(entry.isIntersecting)
      },
      { threshold: 0.05 }
    )
    observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  // 3. Card focus effect while scrolling & track progress
  const updateScrollMetrics = useCallback(() => {
    const container = scrollRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    const maxScroll = scrollWidth - clientWidth

    // Arrow states
    setCanScrollLeft(scrollLeft > 4)
    setCanScrollRight(scrollLeft < maxScroll - 4)

    // Scroll progress ratio (0 to 1)
    if (maxScroll > 0) {
      setScrollProgress(Math.min(1, Math.max(0, scrollLeft / maxScroll)))
    }

    // Dynamic focus calculation: center card is 1.0 scale & opacity, others 0.96 scale & 0.70 opacity
    if (!prefersReducedMotion) {
      const containerRect = container.getBoundingClientRect()
      const centerX = containerRect.left + containerRect.width / 2

      const cards = container.querySelectorAll<HTMLElement>('.rail-course-card')
      cards.forEach((card) => {
        const cardRect = card.getBoundingClientRect()
        const cardCenter = cardRect.left + cardRect.width / 2
        const dist = Math.abs(cardCenter - centerX)
        const maxDist = containerRect.width * 0.55
        const ratio = Math.min(1, dist / maxDist)

        const scale = 1 - 0.04 * ratio
        const opacity = 1 - 0.3 * ratio

        card.style.setProperty('--card-scale', scale.toFixed(3))
        card.style.setProperty('--card-opacity', opacity.toFixed(3))
      })
    }
  }, [prefersReducedMotion])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    updateScrollMetrics()
    const handleScroll = () => {
      requestAnimationFrame(updateScrollMetrics)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    return () => {
      container.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [updateScrollMetrics])

  // 8. Swipe hint: nudge 40px left and back once in session
  useEffect(() => {
    if (!isSectionInView || prefersReducedMotion) return
    const hasNudged = sessionStorage.getItem('samvidhan:swipe-hint-shown')
    if (hasNudged) return

    sessionStorage.setItem('samvidhan:swipe-hint-shown', 'true')
    const timer = setTimeout(() => {
      if (!scrollRef.current) return
      const el = scrollRef.current
      el.classList.add('is-nudging')
      setTimeout(() => {
        el.classList.remove('is-nudging')
      }, 450)
    }, 850)

    return () => clearTimeout(timer)
  }, [isSectionInView, prefersReducedMotion])

  // 7. Arrow buttons scroll by exactly one card width
  const scrollByCard = (direction: 'left' | 'right') => {
    const container = scrollRef.current
    if (!container) return

    const firstCard = container.querySelector<HTMLElement>('.rail-course-card')
    const cardWidth = firstCard ? firstCard.offsetWidth : 350
    const gap = 24
    const delta = (cardWidth + gap) * (direction === 'left' ? -1 : 1)

    container.scrollBy({ left: delta, behavior: 'smooth' })
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      scrollByCard('left')
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      scrollByCard('right')
    }
  }

  // 9. Desktop drag-to-scroll with inertia
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch' || e.button !== 0 || !scrollRef.current) return

    isDragging.current = true
    dragMoved.current = false
    dragStartX.current = e.clientX
    dragScrollLeft.current = scrollRef.current.scrollLeft
    lastX.current = e.clientX
    lastTime.current = performance.now()
    velocity.current = 0

    scrollRef.current.classList.add('is-dragging')
    scrollRef.current.style.scrollSnapType = 'none'
    scrollRef.current.style.scrollBehavior = 'auto'
    scrollRef.current.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || !scrollRef.current) return

    const dx = e.clientX - dragStartX.current
    if (Math.abs(dx) > 5) {
      dragMoved.current = true
    }

    const now = performance.now()
    const dt = now - lastTime.current
    if (dt > 10) {
      velocity.current = (e.clientX - lastX.current) / dt
      lastX.current = e.clientX
      lastTime.current = now
    }

    scrollRef.current.scrollLeft = dragScrollLeft.current - dx
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || !scrollRef.current) return
    isDragging.current = false

    try {
      scrollRef.current.releasePointerCapture(e.pointerId)
    } catch {
      // ignore
    }

    scrollRef.current.classList.remove('is-dragging')
    scrollRef.current.style.scrollSnapType = 'x mandatory'
    scrollRef.current.style.scrollBehavior = 'smooth'

    // Apply inertia coast if released with speed
    if (Math.abs(velocity.current) > 0.2) {
      const coastDelta = -velocity.current * 220
      scrollRef.current.scrollBy({ left: coastDelta, behavior: 'smooth' })
    }

    setTimeout(() => {
      dragMoved.current = false
    }, 60)
  }

  // 4. Pointer glow (mouse devices)
  const handleCardPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (window.matchMedia('(hover: none)').matches) return
    const card = e.currentTarget
    if (glowRaf.current) cancelAnimationFrame(glowRaf.current)
    glowRaf.current = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      card.style.setProperty('--mx', `${mx}px`)
      card.style.setProperty('--my', `${my}px`)
    })
  }

  // Animation variants
  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 8,
      filter: prefersReducedMotion ? 'none' : 'blur(8px)',
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: prefersReducedMotion ? 0.2 : 0.6,
        delay: prefersReducedMotion ? 0 : 0.12 + i * 0.06,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    }),
  }

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 24,
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0.2 : 0.55,
        delay: prefersReducedMotion ? 0 : 0.28 + i * 0.08,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    }),
  }

  return (
    <section
      ref={sectionRef}
      className={`courses-rail-section container ${!isSectionVisible ? 'is-offscreen' : ''}`}
      aria-labelledby="curriculum-rail-heading"
    >
      {/* 10. Drifting Gold Radial Glow Background */}
      <div className="courses-rail-bg-glow" aria-hidden="true" />

      {/* Step 0: Centered Section Header */}
      <header className="courses-rail-header">
        {/* Eyebrow */}
        <motion.div
          className="rail-header-eyebrow"
          initial={{ opacity: 0, y: 10 }}
          animate={isSectionInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <GraduationCap size={15} className="text-gold" aria-hidden="true" />
          <span>Structured Syllabus</span>
        </motion.div>

        {/* 1. Word-by-Word Blur-in Title */}
        <h2 id="curriculum-rail-heading" className="courses-rail-title">
          {HEADING_WORDS.map((word, i) => (
            <motion.span
              key={word}
              className="heading-word"
              custom={i}
              initial="hidden"
              animate={isSectionInView ? 'visible' : 'hidden'}
              variants={wordVariants}
            >
              {word}
            </motion.span>
          ))}
        </h2>

        {/* Subtitle */}
        <motion.p
          className="courses-rail-desc"
          initial={{ opacity: 0, y: 16 }}
          animate={isSectionInView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: prefersReducedMotion ? 0.2 : 0.55,
            delay: prefersReducedMotion ? 0 : 0.42,
            ease: 'easeOut',
          }}
        >
          Swipe across comprehensive civic tracks. Track your score and unlock citizen badges.
        </motion.p>

        {/* Step 0: Centered "View all curriculum" Button */}
        <motion.div
          className="courses-rail-cta-wrap"
          initial={{ opacity: 0, y: 16 }}
          animate={isSectionInView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: prefersReducedMotion ? 0.2 : 0.55,
            delay: prefersReducedMotion ? 0 : 0.5,
            ease: 'easeOut',
          }}
        >
          <Link to="/learn" className="btn btn-secondary rail-view-all-btn">
            <span>View all curriculum</span>
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </motion.div>
      </header>

      {/* Outer Row Container Flanked by Nav Arrows */}
      <div className="courses-rail-outer">
        {/* Step 0 & Animation 7: Prev / Next Outside Arrow Buttons */}
        <button
          type="button"
          className="rail-nav-btn prev-btn"
          onClick={() => scrollByCard('left')}
          disabled={!canScrollLeft}
          aria-label="Previous track"
          title="Scroll to previous track"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>

        <button
          type="button"
          className="rail-nav-btn next-btn"
          onClick={() => scrollByCard('right')}
          disabled={!canScrollRight}
          aria-label="Next track"
          title="Scroll to next track"
        >
          <ChevronRight size={22} aria-hidden="true" />
        </button>

        {/* Swipeable & Draggable Scroll Container */}
        <div
          ref={scrollRef}
          className="courses-rail-scroll"
          tabIndex={0}
          role="region"
          aria-label="Official learning tracks"
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {courses.map((course, idx) => {
            const allLessons = lessonsForCourse(course.id)
            const completedCount = allLessons.filter((l) =>
              progress.completedLessonIds.includes(l.id)
            ).length
            const progPercent = percent(completedCount, allLessons.length || 1)

            return (
              <motion.article
                key={course.id}
                className="rail-course-card"
                custom={idx}
                initial="hidden"
                animate={isSectionInView ? 'visible' : 'hidden'}
                variants={cardVariants}
                onPointerMove={handleCardPointerMove}
              >
                {/* Card Header & Content */}
                <div className="rail-card-body">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.85rem',
                    }}
                  >
                    <span
                      className="pill pill-gold"
                      style={{
                        fontSize: '0.72rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {course.category}
                    </span>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        color: '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontWeight: 500,
                      }}
                    >
                      <Clock size={13} aria-hidden="true" />
                      {course.estimatedHours}h
                    </span>
                  </div>

                  <h3 className="rail-card-title">{course.title}</h3>
                  <p className="rail-card-tagline">{course.tagline}</p>
                </div>

                {/* Card Footer: Progress & Start Button */}
                <div className="rail-card-bottom">
                  {/* 5. Progress Bar Fill & CountUp */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.8rem',
                        color: '#94a3b8',
                        marginBottom: '0.45rem',
                        fontWeight: 500,
                      }}
                    >
                      <span>{course.lessonCount} Lessons</span>
                      <span>
                        {isSectionInView ? (
                          <CountUp end={progPercent} duration={700} suffix="% complete" />
                        ) : (
                          '0% complete'
                        )}
                      </span>
                    </div>

                    <div className="rail-progress-track">
                      <div
                        className="rail-progress-fill"
                        style={{
                          width: isSectionInView ? `${progPercent}%` : '0%',
                        }}
                      />
                    </div>
                  </div>

                  {/* 6. Start Track Button with Light Sweep and Icon Slide */}
                  <Link
                    to={`/learn/${course.id}`}
                    className="btn btn-primary rail-track-btn"
                    onClick={(e) => {
                      if (dragMoved.current) {
                        e.preventDefault()
                        e.stopPropagation()
                      }
                    }}
                    aria-label={`${progPercent > 0 ? 'Continue' : 'Start'} ${course.title}`}
                  >
                    <span className="rail-track-btn-icon" aria-hidden="true">
                      <BookOpen size={16} />
                    </span>
                    <span>{progPercent > 0 ? 'Continue Track' : 'Start Track'}</span>
                  </Link>
                </div>
              </motion.article>
            )
          })}
        </div>
      </div>

      {/* Step 0: Slim Custom Scroll Position Progress Bar */}
      <div className="courses-rail-progress-container" aria-hidden="true">
        <div className="courses-rail-progress-track">
          <div
            className="courses-rail-progress-indicator"
            style={{
              transform: `translateX(${scrollProgress * 160}px)`,
            }}
          />
        </div>
      </div>
    </section>
  )
}
