import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import { ThemeProvider } from '../contexts/ThemeContext'
import PublicLayout from '../layouts/PublicLayout'
import AuthLayout from '../layouts/AuthLayout'
import UserLayout from '../layouts/UserLayout'
import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'
import LandingPage from '../pages/LandingPage'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage'
import VerifyEmailPage from '../pages/auth/VerifyEmailPage'
import DashboardPage from '../pages/DashboardPage'
import ProfilePage from '../pages/ProfilePage'
import CourseListPage from '../pages/courses/CourseListPage'
import CourseDetailPage from '../pages/courses/CourseDetailPage'
import LessonDetailPage from '../pages/lessons/LessonDetailPage'
import VocabularyLearningPage from '../pages/lessons/VocabularyLearningPage'
import DeckListPage from '../pages/decks/DeckListPage'
import DeckDetailPage from '../pages/decks/DeckDetailPage'
import FlashcardPage from '../pages/decks/FlashcardPage'
import QuizPage from '../pages/lessons/QuizPage'
import QuizHistoryPage from '../pages/QuizHistoryPage'

function AppRoutes() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/courses" element={<CourseListPage />} />
              <Route path="/courses/:id" element={<CourseDetailPage />} />
              <Route path="/lessons/:id" element={<LessonDetailPage />} />
              <Route path="/lessons/:id/vocabulary" element={<VocabularyLearningPage />} />
              <Route path="/decks" element={<DeckListPage />} />
              <Route path="/decks/:id" element={<DeckDetailPage />} />
              <Route path="/decks/:id/flashcard" element={<FlashcardPage />} />
              <Route path="/lessons/:id/quiz" element={<QuizPage />} />
              <Route path="/quiz-history" element={<QuizHistoryPage />} />
            </Route>
            <Route element={<AuthLayout />}>
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
              </Route>
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route element={<UserLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default AppRoutes
