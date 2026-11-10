import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { SiteLayout } from './layouts/SiteLayout'
import { Loader } from './ui/loaders/Loader'
import { RequireAuth } from './components/auth/RequireAuth'

const HomePage = lazy(() => import('./pages/public/HomePage').then((m) => ({ default: m.HomePage })))
const HowItWorksPage = lazy(() =>
  import('./pages/public/SimplePages').then((m) => ({ default: m.HowItWorksPage })),
)
const AboutPage = lazy(() => import('./pages/public/SimplePages').then((m) => ({ default: m.AboutPage })))
const DesignPrinciplesPage = lazy(() => import('./pages/public/DesignPrinciplesPage').then((m) => ({ default: m.DesignPrinciplesPage })))
const ContactPage = lazy(() => import('./pages/public/SimplePages').then((m) => ({ default: m.ContactPage })))
const PrivacyPage = lazy(() => import('./pages/public/SimplePages').then((m) => ({ default: m.PrivacyPage })))
const TermsPage = lazy(() => import('./pages/public/SimplePages').then((m) => ({ default: m.TermsPage })))
const DisclaimerPage = lazy(() =>
  import('./pages/public/SimplePages').then((m) => ({ default: m.DisclaimerPage })),
)
const NotFoundPage = lazy(() => import('./pages/public/SimplePages').then((m) => ({ default: m.NotFoundPage })))
const AuthPage = lazy(() => import('./pages/auth/AuthPages').then((m) => ({ default: m.AuthPage })))
const ForgotPasswordPage = lazy(() =>
  import('./pages/auth/AuthPages').then((m) => ({ default: m.ForgotPasswordPage })),
)
const OnboardingFlow = lazy(() => import('./pages/onboarding/OnboardingFlow').then((m) => ({ default: m.OnboardingFlow })))
const LearnIndexPage = lazy(() =>
  import('./pages/learning/LearnPages').then((m) => ({ default: m.LearnIndexPage })),
)
const CoursePage = lazy(() => import('./pages/learning/LearnPages').then((m) => ({ default: m.CoursePage })))
const LessonPage = lazy(() => import('./pages/learning/LearnPages').then((m) => ({ default: m.LessonPage })))
const QuizPage = lazy(() => import('./pages/learning/QuizPages').then((m) => ({ default: m.QuizPage })))
const QuizResultsPage = lazy(() =>
  import('./pages/learning/QuizPages').then((m) => ({ default: m.QuizResultsPage })),
)
const ConstitutionIndexPage = lazy(() =>
  import('./pages/constitution/ConstitutionPages').then((m) => ({ default: m.ConstitutionIndexPage })),
)
const ConstitutionTopicPage = lazy(() =>
  import('./pages/constitution/ConstitutionPages').then((m) => ({ default: m.ConstitutionTopicPage })),
)
const LibraryIndexPage = lazy(() =>
  import('./pages/library/LibraryPages').then((m) => ({ default: m.LibraryIndexPage })),
)
const LibraryDocumentPage = lazy(() =>
  import('./pages/library/LibraryPages').then((m) => ({ default: m.LibraryDocumentPage })),
)
const SearchPage = lazy(() => import('./pages/search/SearchPage').then((m) => ({ default: m.SearchPage })))
const AskPage = lazy(() => import('./pages/assistant/AskPage').then((m) => ({ default: m.AskPage })))
const DashboardPage = lazy(() =>
  import('./pages/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const ProfilePage = lazy(() => import('./pages/profile/PersonalPages').then((m) => ({ default: m.ProfilePage })))
const ProgressPage = lazy(() =>
  import('./pages/profile/PersonalPages').then((m) => ({ default: m.ProgressPage })),
)
const BookmarksPage = lazy(() =>
  import('./pages/profile/PersonalPages').then((m) => ({ default: m.BookmarksPage })),
)
const SavedPage = lazy(() => import('./pages/profile/PersonalPages').then((m) => ({ default: m.SavedPage })))
const SettingsPage = lazy(() =>
  import('./pages/profile/PersonalPages').then((m) => ({ default: m.SettingsPage })),
)
const ReferralPage = lazy(() =>
  import('./pages/growth/ReferralPage').then((m) => ({ default: m.ReferralPage })),
)
const AffiliatePage = lazy(() =>
  import('./pages/growth/AffiliatePage').then((m) => ({ default: m.AffiliatePage })),
)
const DevLoadersPage = lazy(() => import('./pages/dev/DevLoadersPage'))
const DevMorPage = lazy(() => import('./pages/dev/DevMorPage').then((m) => ({ default: m.DevMorPage })))

// Admin Lazy Modules
const AdminGuard = lazy(() => import('./pages/admin/AdminGuard').then((m) => ({ default: m.AdminGuard })))
const ForbiddenPage = lazy(() => import('./pages/admin/ForbiddenPage').then((m) => ({ default: m.ForbiddenPage })))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })))
const AdminContentManager = lazy(() => import('./pages/admin/AdminContentManager').then((m) => ({ default: m.AdminContentManager })))
const AdminReviewWorkflow = lazy(() => import('./pages/admin/AdminReviewWorkflow').then((m) => ({ default: m.AdminReviewWorkflow })))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers').then((m) => ({ default: m.AdminUsers })))
const AdminReports = lazy(() => import('./pages/admin/AdminReports').then((m) => ({ default: m.AdminReports })))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings').then((m) => ({ default: m.AdminSettings })))
const AdminAudit = lazy(() => import('./pages/admin/AdminAudit').then((m) => ({ default: m.AdminAudit })))

export default function App() {
  return (
    <Suspense fallback={<Loader variant="book" caption="Opening the Constitution…" fullscreen />}>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/design-principles" element={<DesignPrinciplesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/disclaimer" element={<DisclaimerPage />} />
          <Route path="/login" element={<AuthPage defaultMode="login" />} />
          <Route path="/signup" element={<AuthPage defaultMode="signup" />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/onboarding" element={<OnboardingFlow />} />
          <Route path="/learn" element={<LearnIndexPage />} />
          <Route path="/learn/:courseId" element={<CoursePage />} />
          <Route path="/learn/:courseId/:lessonId" element={<LessonPage />} />
          <Route path="/quiz/:quizId" element={<QuizPage />} />
          <Route path="/quiz/:quizId/results" element={<QuizResultsPage />} />
          <Route path="/constitution" element={<ConstitutionIndexPage />} />
          <Route path="/constitution/:topicId" element={<ConstitutionTopicPage />} />
          <Route path="/library" element={<LibraryIndexPage />} />
          <Route path="/library/:documentId" element={<LibraryDocumentPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/ask" element={<AskPage />} />
          <Route path="/ask/:conversationId" element={<AskPage />} />
          <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/progress" element={<RequireAuth><ProgressPage /></RequireAuth>} />
          <Route path="/bookmarks" element={<RequireAuth><BookmarksPage /></RequireAuth>} />
          <Route path="/saved" element={<RequireAuth><SavedPage /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
          <Route path="/refer" element={<RequireAuth><ReferralPage /></RequireAuth>} />
          <Route path="/affiliates" element={<AffiliatePage />} />
          {import.meta.env.DEV && (
            <>
              <Route path="/dev/loaders" element={<DevLoadersPage />} />
              <Route path="/dev/mor" element={<DevMorPage />} />
            </>
          )}
          <Route path="/paths/:role" element={<Navigate to="/learn" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Dedicated Admin Shell & RBAC Guarded Routes */}
        <Route path="/admin/forbidden" element={<ForbiddenPage />} />
        <Route path="/admin" element={<AdminGuard />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="content" element={<AdminContentManager />} />
            <Route path="review" element={<AdminReviewWorkflow />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="audit" element={<AdminAudit />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}
