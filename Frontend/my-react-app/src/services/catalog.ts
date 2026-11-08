/**
 * Catalog Service Bridge
 * Delegates to modern typed API layer in src/api
 */
export {
  listCourses,
  getCourse,
  getLesson,
  lessonsForCourse,
  continueLesson,
  getQuiz,
  getConstitutionTopic,
  getLibraryDocument,
  listConstitutionTopics,
  listLibraryDocuments,
  getLearningUnits,
  neighbours,
} from '../api/services/catalogService'

export { searchAll } from '../api/services/searchService'
