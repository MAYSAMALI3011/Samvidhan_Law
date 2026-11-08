import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
    ArrowRight,
  BookOpen,
    CheckCircle,
  Clock,
    FileText,
  } from 'lucide-react'
import { Button, ButtonLink } from '../../components/common/Button'
import { Breadcrumbs, ProgressBar } from '../../components/common/ProgressBar'
import { CourseCard } from '../../components/learning/CourseCard'
import { LessonPlayer } from '../../components/learning/LessonPlayer'
import { unitsData } from '../../data/mock/learningUnits'
import { LearningSidebar } from '../../components/navigation/LearningSidebar'
import { useAppState } from '../../context/useAppState'
import { courses } from '../../data/mock/curriculum'
import { getCourse, getLesson, lessonsForCourse, neighbours } from '../../services/catalog'
import { usePageMeta } from '../../hooks/usePageMeta'
import { percent } from '../../utils/format'
import { EmptyState } from '../../components/feedback/Toasts'
import { ShareButton } from '../../components/common/ShareButton'
import { BackButton } from '../../components/common/BackButton'
import { AutoGrowTextarea } from '../../components/ui/TextFields.jsx'
import { useAutosave } from '../../hooks/useAutosave'

export function LearnIndexPage() {
  const { progress } = useAppState()
  const [filter, setFilter] = useState('All')

  usePageMeta({
    title: 'Curriculum & Courses',
    description: 'Explore the structured Samvidhan legal literacy curriculum.',
    path: '/learn',
  })

  const filteredCourses = courses.filter((c) => {
    if (filter === 'All') return true
    if (filter === 'Foundations') return c.level === 'Foundation'
    if (filter === 'Citizen Rights') return c.category.includes('Rights') || c.level === 'Core'
    if (filter === 'Everyday Law') return c.category.includes('Everyday') || c.level === 'Applied'
    return true
  })

  const totalLessons = courses.reduce((acc, c) => acc + c.lessonCount, 0)
  const completedCount = progress.completedLessonIds.length

  return (
    <div className="container learn-layout">
      <LearningSidebar />
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <p className="kicker">Catalogue</p>
          <h1>Curriculum & Courses</h1>
          <p className="muted" style={{ maxWidth: '42rem' }}>
            A structured path for constitutional literacy and practical citizen rights. From foundational governance to everyday civil situations.
          </p>

          <div
            className="panel"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.25rem',
              marginTop: '1.5rem',
              background: 'var(--surface)',
            }}
          >
            <div>
              <p className="eyebrow" style={{ marginBottom: '0.25rem' }}>Your Progress</p>
              <h3 style={{ margin: 0 }}>
                {completedCount} of {totalLessons} Lessons Completed ({percent(completedCount, totalLessons)}%)
              </h3>
            </div>
            <div style={{ minWidth: '200px', flex: 1, maxWidth: '320px' }}>
              <ProgressBar value={percent(completedCount, totalLessons)} />
            </div>
          </div>
        </div>

        {/* Animated Curriculum Pill Tabs */}
        <div className="curriculum-pill-tabs" role="tablist" aria-label="Course Category Filters">
          {['All', 'Foundations', 'Citizen Rights', 'Everyday Law'].map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={filter === tab}
              className={`curriculum-tab-pill ${filter === tab ? 'is-active' : ''}`}
              onClick={() => setFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid-2">
          {filteredCourses.map((course) => {
            const done = progress.completedLessonIds.filter((id) =>
              course.chapters.some((ch) => ch.lessonIds.includes(id)),
            ).length
            return (
              <CourseCard
                key={course.id}
                course={course}
                progress={percent(done, course.lessonCount)}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function CoursePage() {
  const { courseId = '' } = useParams()
  const course = getCourse(courseId)
  const { progress } = useAppState()

  usePageMeta({
    title: course?.title ?? 'Course',
    description: course?.description ?? 'Course overview',
    path: `/learn/${courseId}`,
  })

  if (!course) {
    return <EmptyState title="Course not found" body="That course is not in the sample curriculum." />
  }

  const list = lessonsForCourse(course.id)
  const done = list.filter((l) => progress.completedLessonIds.includes(l.id)).length
  const courseProgress = percent(done, list.length)
  const firstIncomplete = list.find((l) => !progress.completedLessonIds.includes(l.id)) ?? list[0]

  return (
    <div className="container page-hero">
      <BackButton to="/learn" label="Back to Curriculum" />
      <Breadcrumbs items={[{ to: '/learn', label: 'Curriculum' }, { label: course.title }]} />

      <div
        className="panel"
        style={{
          borderLeft: '4px solid var(--gold)',
          padding: '2rem 2.25rem',
          marginBottom: '2.5rem',
          background: 'var(--surface)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--gold)',
                background: 'var(--gold-light)',
                padding: '0.25rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {course.level}
            </span>
            <h1 style={{ marginTop: '0.6rem', marginBottom: '0.5rem' }}>{course.title}</h1>
            <p className="muted" style={{ maxWidth: '44rem', fontSize: '1.05rem', margin: 0 }}>
              {course.description}
            </p>
          </div>

          {firstIncomplete ? (
            <ButtonLink
              to={`/learn/${course.id}/${firstIncomplete.id}`}
              variant="gold"
              style={{ paddingInline: '1.5rem', minHeight: '48px', fontSize: '1rem' }}
            >
              <span>{done > 0 ? 'Resume Course' : 'Start Course'}</span>
              <ArrowRight size={17} aria-hidden="true" />
            </ButtonLink>
          ) : null}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1.5rem', flexWrap: 'wrap', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <BookOpen size={16} style={{ color: 'var(--gold)' }} aria-hidden="true" />
            {course.lessonCount} Lessons
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={16} style={{ color: 'var(--gold)' }} aria-hidden="true" />
            {course.estimatedHours} Hours total
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileText size={16} style={{ color: 'var(--gold)' }} aria-hidden="true" />
            {course.chapters.length} Chapters
          </span>
        </div>

        <div style={{ marginTop: '1.25rem', maxWidth: '420px' }}>
          <ProgressBar value={courseProgress} label={`Course progress (${done}/${list.length} completed)`} />
        </div>
      </div>

      <div style={{ maxWidth: '54rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Syllabus & Chapters</h2>

        {course.chapters.map((chapter, cIdx) => (
          <section
            key={chapter.id}
            style={{
              marginBottom: '2rem',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <div
              style={{
                padding: '1rem 1.5rem',
                background: 'var(--surface-2)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>
                Chapter {cIdx + 1}: {chapter.title}
              </h3>
              <span className="meta">{chapter.lessonIds.length} lessons</span>
            </div>

            <div style={{ padding: '1rem 1.25rem', display: 'grid', gap: '0.75rem' }}>
              {chapter.lessonIds.map((id) => {
                const lesson = getLesson(id)
                if (!lesson) return null
                const isCompleted = progress.completedLessonIds.includes(id)

                return (
                  <Link
                    key={id}
                    to={`/learn/${course.id}/${lesson.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--surface)',
                      transition: 'all var(--transition-fast)',
                    }}
                    className="lesson-list-item"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      {isCompleted ? (
                        <CheckCircle size={20} style={{ color: 'var(--success)', flexShrink: 0 }} aria-label="Completed" />
                      ) : (
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            border: '2px solid var(--border)',
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <div>
                        <strong style={{ fontSize: '0.98rem', display: 'block', color: 'var(--text)' }}>
                          {lesson.title}
                        </strong>
                        <small className="muted">{lesson.summary}</small>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                      <span className="meta" style={{ fontSize: '0.82rem' }}>
                        {lesson.durationMinutes} min
                      </span>
                      {lesson.quizId ? (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.45rem',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--gold-light)',
                            color: 'var(--gold)',
                          }}
                        >
                          Quiz
                        </span>
                      ) : null}
                      <ArrowRight size={16} style={{ color: 'var(--gold)' }} aria-hidden="true" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

function LessonNotesSection({ lessonId }: { lessonId: string }) {
  const [notes, setNotes] = useState<string>(() => {
    try {
      const raw = localStorage.getItem(`autosave:samvidhan-lesson-notes-${lessonId}`)
      return raw ? JSON.parse(raw) : ''
    } catch {
      return ''
    }
  })

  const { status: autosaveStatus } = useAutosave({
    key: `samvidhan-lesson-notes-${lessonId}`,
    value: notes,
  })

  return (
    <section className="panel" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Citizen Study Notes</h3>
        <span
          style={{
            fontSize: '0.8rem',
            color: autosaveStatus === 'saving' ? 'var(--gold)' : autosaveStatus === 'saved' ? 'var(--success)' : 'var(--text-muted)',
            fontWeight: 500,
          }}
        >
          {autosaveStatus === 'saving'
            ? 'Saving…'
            : autosaveStatus === 'saved'
              ? 'Saved ✓'
              : autosaveStatus === 'offline'
                ? 'Offline (draft preserved)'
                : 'Auto-saved'}
        </span>
      </div>
      <AutoGrowTextarea
        label="Personal Notes"
        placeholder="Jot down key takeaways, personal questions, or revision notes..."
        value={notes}
        onChange={setNotes}
      />
    </section>
  )
}

export function LessonPage() {
  const { courseId = '', lessonId = '' } = useParams()
  const navigate = useNavigate()
  const { progress, completeLesson, toggleBookmark, toggleSaved, pushToast } = useAppState()
  const [interactiveMode, setInteractiveMode] = useState(false)

  // 1. Check if lesson exists in modern Duolingo unitsData
  type UnitLessonType = (typeof unitsData)[number]['lessons'][number]
  let unitLesson: UnitLessonType | null = null
  for (const u of unitsData) {
    const found = u.lessons.find((l) => l.id === lessonId)
    if (found) {
      unitLesson = found
      break
    }
  }

  // 2. Check if lesson exists in standard catalog
  const catalogLesson = getLesson(lessonId)
  const course = getCourse(courseId)

  usePageMeta({
    title: unitLesson ? unitLesson.title : (catalogLesson?.title ?? 'Lesson'),
    description: unitLesson ? unitLesson.subtitle : (catalogLesson?.summary ?? 'Lesson'),
    path: '/learn/' + courseId + '/' + lessonId,
  })

  // If this is a modern unit lesson with rich interactive cards: render LessonPlayer directly!
  if (unitLesson) {
    const handleComplete = () => {
      completeLesson(unitLesson.id, unitLesson.title)
      pushToast('Mastery complete! +' + (unitLesson.xp || 15) + ' XP earned & streak saved!', 'success')
      navigate('/dashboard')
    }

    return (
      <div className="focused-unit-lesson-viewport">
        <LessonPlayer
          lessonTitle={unitLesson.title}
          articleCitation={unitLesson.articleCitation}
          cards={unitLesson.cards}
          quizQuestions={unitLesson.quizQuestions}
          onComplete={handleComplete}
          onExit={() => window.history.back()}
        />
      </div>
    )
  }

  // If not found in catalog either
  if (!catalogLesson || catalogLesson.courseId !== courseId) {
    return <EmptyState title="Lesson not found" body="This lesson is not in the sample curriculum." />
  }

  const { prev, next } = neighbours(catalogLesson)
  const completed = progress.completedLessonIds.includes(catalogLesson.id)
  const saved = progress.savedLessonIds.includes(catalogLesson.id)
  const booked = progress.bookmarks.includes(catalogLesson.id)

  if (interactiveMode) {
    // Generate interactive cards on the fly from catalog lesson content
    const dynamicCards = catalogLesson.content.map((para, i) => ({
      id: 'card-' + i,
      kicker: 'PART ' + (i + 1),
      title: i === 0 ? catalogLesson.title : 'Section ' + (i + 1),
      summary: para,
      simplifiedSummary: para.length > 120 ? para.slice(0, 120) + '...' : para,
      takeaway: 'Key takeaway from ' + catalogLesson.title,
      glossaryTerms: [],
    }))

    return (
      <div className="focused-unit-lesson-viewport">
        <LessonPlayer
          lessonTitle={catalogLesson.title}
          articleCitation="Constitution of India"
          cards={dynamicCards}
          onComplete={() => {
            completeLesson(catalogLesson.id, catalogLesson.title)
            pushToast('Lesson completed! +15 XP earned', 'success')
            setInteractiveMode(false)
          }}
          onExit={() => setInteractiveMode(false)}
        />
      </div>
    )
  }

  return (
    <article className="container reading-layout page-hero">
      <BackButton to={'/learn/' + catalogLesson.courseId} label="Back to Course Syllabus" />
      <Breadcrumbs
        items={[
          { to: '/learn', label: 'Curriculum' },
          { to: '/learn/' + catalogLesson.courseId, label: course?.title ?? 'Course' },
          { label: catalogLesson.title },
        ]}
      />

      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--gold)',
              background: 'var(--gold-light)',
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {catalogLesson.durationMinutes} min read
          </span>
          <span className="meta">Verified Educational Guide</span>
          {completed ? (
            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--success)', fontWeight: 600, fontSize: '0.88rem' }}>
              <CheckCircle size={16} aria-hidden="true" /> Completed
            </span>
          ) : null}
          <button
            type="button"
            className="btn btn-sm btn-primary"
            style={{ marginLeft: completed ? '0.75rem' : 'auto' }}
            onClick={() => setInteractiveMode(true)}
          >
            Launch Interactive Lesson
          </button>
        </div>

        <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)' }}>{catalogLesson.title}</h1>
        <p className="muted" style={{ fontSize: '1.15rem', lineHeight: '1.6', margin: 0 }}>
          {catalogLesson.summary}
        </p>
      </header>

      {/* Main Educational Text */}
      <div className="reading">
        {catalogLesson.content.map((p, pIdx) => (
          <p key={pIdx}>{p}</p>
        ))}
      </div>

      {catalogLesson.takeaways?.length ? (
        <section className="panel" style={{ marginTop: '2rem' }}>
          <h3>Key takeaways</h3>
          <ul style={{ paddingLeft: '1.25rem', margin: '0.5rem 0 0' }}>
            {catalogLesson.takeaways.map((t, tIdx) => (
              <li key={tIdx} style={{ marginBottom: '0.35rem' }}>{t}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <LessonNotesSection lessonId={catalogLesson.id} />

      {/* Action footer */}
      <footer
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '3rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button
            variant={completed ? 'secondary' : 'gold'}
            onClick={() => {
              completeLesson(catalogLesson.id, catalogLesson.title)
              pushToast(completed ? 'Already marked as complete.' : 'Lesson marked complete! Progress saved.', 'success')
            }}
          >
            {completed ? 'Completed' : 'Mark as Complete'}
          </Button>

          <Button
            variant={booked ? 'primary' : 'secondary'}
            onClick={() => {
              toggleBookmark(catalogLesson.id)
              pushToast(booked ? 'Bookmark removed.' : 'Lesson bookmarked.', 'info')
            }}
          >
            {booked ? 'Bookmarked' : 'Bookmark'}
          </Button>

          <Button
            variant={saved ? 'primary' : 'secondary'}
            onClick={() => {
              toggleSaved(catalogLesson.id)
              pushToast(saved ? 'Removed from saved lessons.' : 'Saved for later.', 'info')
            }}
          >
            {saved ? 'Saved for Later' : 'Save for Later'}
          </Button>

          <ShareButton title={catalogLesson.title} />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {prev ? (
            <ButtonLink to={'/learn/' + catalogLesson.courseId + '/' + prev.id} variant="secondary">
              &larr; Previous Lesson
            </ButtonLink>
          ) : null}
          {next ? (
            <ButtonLink to={'/learn/' + catalogLesson.courseId + '/' + next.id} variant="primary">
              Next Lesson &rarr;
            </ButtonLink>
          ) : (
            <ButtonLink to={'/quiz/' + catalogLesson.id} variant="gold">
              Take Quiz &rarr;
            </ButtonLink>
          )}
        </div>
      </footer>
    </article>
  )
}
