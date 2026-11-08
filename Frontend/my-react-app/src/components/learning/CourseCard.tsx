import { ArrowRight, BookOpen, CheckCircle, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Course } from '../../types'
import { ProgressBar } from '../common/ProgressBar'

export function CourseCard({ course, progress = 0 }: { course: Course; progress?: number }) {
  const isComplete = progress === 100
  const hasStarted = progress > 0

  return (
    <Link
      to={`/learn/${course.id}`}
      className="course-card clickable-card"
      aria-label={`${course.title} - ${course.level} course with ${course.lessonCount} lessons`}
    >
      <div className="course-card-top">
        <span className="course-level-badge">{course.level}</span>
        <span className="course-category-label">{course.category}</span>
      </div>

      <h3 className="course-card-title">{course.title}</h3>
      <p className="course-card-desc">{course.tagline}</p>

      <div className="course-card-meta">
        <span className="course-meta-item">
          <BookOpen size={15} className="course-meta-icon" aria-hidden="true" />
          {course.lessonCount} lessons
        </span>
        <span className="course-meta-item">
          <Clock size={15} className="course-meta-icon" aria-hidden="true" />
          {course.estimatedHours} hrs
        </span>
        {isComplete ? (
          <span className="course-completed-badge">
            <CheckCircle size={15} aria-hidden="true" /> Done
          </span>
        ) : null}
      </div>

      <div className="course-card-progress">
        <ProgressBar value={progress} label={hasStarted ? 'Progress' : undefined} />
      </div>

      <div className="course-card-footer">
        <span className="course-card-link-text">
          {isComplete ? 'Review Course' : hasStarted ? 'Continue Learning' : 'Start Course'}
        </span>
        <ArrowRight size={16} className="course-card-arrow" aria-hidden="true" />
      </div>
    </Link>
  )
}

export function LessonCard({
  to,
  title,
  meta,
  summary,
}: {
  to: string
  title: string
  meta: string
  summary: string
}) {
  const isCompleted = meta.toLowerCase().includes('completed')

  return (
    <Link
      to={to}
      className="course-card lesson-card clickable-card"
      aria-label={`${title} - ${meta}`}
    >
      <div className="course-card-top">
        <span className="course-level-badge">{meta}</span>
        {isCompleted ? (
          <span className="course-completed-badge">
            <CheckCircle size={16} aria-label="Completed" />
          </span>
        ) : null}
      </div>
      <h3 className="course-card-title">{title}</h3>
      <p className="course-card-desc">{summary}</p>
      <div className="course-card-footer">
        <span className="course-card-link-text">Read Lesson</span>
        <ArrowRight size={15} className="course-card-arrow" aria-hidden="true" />
      </div>
    </Link>
  )
}
