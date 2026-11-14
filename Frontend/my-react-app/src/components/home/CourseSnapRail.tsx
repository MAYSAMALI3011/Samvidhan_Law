import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, BookOpen, Clock, ArrowRight, GraduationCap } from 'lucide-react'
import { courses } from '../../data/mock/curriculum'
import { useAppState } from '../../context/useAppState'
import { lessonsForCourse } from '../../services/catalog'
import { percent } from '../../utils/format'

export function CourseSnapRail() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { progress } = useAppState()

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const offset = direction === 'left' ? -360 : 360
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
  }

  return (
    <section className="courses-rail-section container" aria-labelledby="curriculum-rail-heading" style={{ margin: '3.5rem auto' }}>
      <header className="section-head" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <span className="section-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <GraduationCap size={13} className="text-gold" aria-hidden="true" />
            Structured Syllabus
          </span>
          <h2 id="curriculum-rail-heading" className="section-title" style={{ margin: '0.25rem 0 0' }}>
            Official learning tracks
          </h2>
          <p className="section-desc" style={{ margin: '0.25rem 0 0' }}>
            Swipe across comprehensive civic tracks. Track your score and unlock citizen badges.
          </p>
        </div>

        <Link to="/learn" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
          <span>View all curriculum</span>
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </header>

      <div className="courses-rail-wrapper">
        {/* Left / Right Scroll Buttons (Desktop) */}
        <button
          type="button"
          className="rail-nav-btn prev-btn"
          onClick={() => scroll('left')}
          aria-label="Scroll curriculum tracks left"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>

        <button
          type="button"
          className="rail-nav-btn next-btn"
          onClick={() => scroll('right')}
          aria-label="Scroll curriculum tracks right"
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>

        {/* Swipeable Scroll Container */}
        <div className="courses-rail-scroll" ref={scrollRef} tabIndex={0} role="region" aria-label="Course tracks carousel">
          {courses.map((course) => {
            const allLessons = lessonsForCourse(course.id)
            const completedCount = allLessons.filter((l) => progress.completedLessonIds.includes(l.id)).length
            const progPercent = percent(completedCount, allLessons.length || 1)

            return (
              <article key={course.id} className="rail-course-card">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span className="pill pill-gold" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {course.category}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} aria-hidden="true" />
                      {course.estimatedHours}h
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', margin: '0 0 0.45rem', lineHeight: 1.35 }}>
                    {course.title}
                  </h3>

                  <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.45, margin: '0 0 1.25rem' }}>
                    {course.tagline}
                  </p>
                </div>

                <div>
                  {/* Progress Bar & Lesson Count */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                      <span>{course.lessonCount} Lessons</span>
                      <span>{progPercent}% complete</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${progPercent}%`,
                          background: 'linear-gradient(90deg, var(--gold, #dfba73), #e6ca8d)',
                          borderRadius: '3px',
                          transition: 'width var(--dur-slow) ease-out',
                        }}
                      />
                    </div>
                  </div>

                  <Link
                    to={`/learn/${course.id}`}
                    className="btn btn-outline"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <BookOpen size={15} aria-hidden="true" />
                    <span>{progPercent > 0 ? 'Continue Track' : 'Start Track'}</span>
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
