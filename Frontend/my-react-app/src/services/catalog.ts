import { constitutionTopics } from '../data/mock/constitution'
import { courses, lessons, quizzes } from '../data/mock/curriculum'
import { libraryDocuments } from '../data/mock/library'
import type { ConstitutionTopic, Course, Lesson, LibraryDocument, Quiz } from '../types'
import { delay } from './delay'

export async function listCourses(): Promise<Course[]> {
  await delay()
  return courses
}

export function getCourse(id: string): Course | undefined {
  return courses.find((c) => c.id === id)
}

export function getLesson(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id)
}

export function lessonsForCourse(courseId: string): Lesson[] {
  return lessons.filter((l) => l.courseId === courseId)
}

export function continueLesson(completed: string[]): Lesson {
  return lessons.find((lesson) => !completed.includes(lesson.id)) ?? lessons[0]
}

export function getQuiz(id: string): Quiz | undefined {
  return quizzes.find((q) => q.id === id)
}

export function getConstitutionTopic(id: string): ConstitutionTopic | undefined {
  return constitutionTopics.find((t) => t.id === id)
}

export function getLibraryDocument(id: string): LibraryDocument | undefined {
  return libraryDocuments.find((d) => d.id === id)
}

export async function searchAll(query: string): Promise<{
  courses: Course[]
  lessons: Lesson[]
  topics: ConstitutionTopic[]
  documents: LibraryDocument[]
}> {
  await delay(120)
  const q = query.trim().toLowerCase()
  if (!q) return { courses: [], lessons: [], topics: [], documents: [] }
  const match = (text: string) => text.toLowerCase().includes(q)
  return {
    courses: courses.filter((c) => match(c.title) || match(c.description) || match(c.category)),
    lessons: lessons.filter((l) => match(l.title) || match(l.summary) || l.content.some(match)),
    topics: constitutionTopics.filter((t) => match(t.title) || match(t.summary) || match(t.part)),
    documents: libraryDocuments.filter(
      (d) => match(d.title) || match(d.summary) || d.tags.some(match) || match(d.category),
    ),
  }
}

export function neighbours(lesson: Lesson): { prev?: Lesson; next?: Lesson } {
  const list = lessonsForCourse(lesson.courseId)
  const i = list.findIndex((l) => l.id === lesson.id)
  return { prev: list[i - 1], next: list[i + 1] }
}
