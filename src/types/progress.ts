// Khớp progress/dto/response/CourseEnrollmentResponse.java, ProgressDashboardResponse.java,
// ContinueLearningResponse.java ở Backend.

export type EnrollmentStatus = 'IN_PROGRESS' | 'COMPLETED'

/** Trả về từ POST /api/courses/{id}/enroll. */
export interface CourseEnrollmentResponse {
  id: number
  courseId: number
  courseTitle: string
  status: EnrollmentStatus
  progressPercent: number
  enrolledAt: string
}

export type DailyGoalType = 'TIME' | 'WORDS'

/** Khoá học + bài học kế tiếp để hiển thị "Continue Learning" - null nếu chưa enroll khoá nào đang IN_PROGRESS. */
export interface ContinueLearningResponse {
  courseId: number
  courseTitle: string
  lessonId: number
  lessonTitle: string
}

/** Trả về từ GET /api/progress/dashboard. */
export interface ProgressDashboardResponse {
  dailyGoalType: DailyGoalType
  dailyGoalValue: number
  todayStudyMinutes: number
  todayWordsLearned: number
  goalMet: boolean
  currentStreak: number
  longestStreak: number
  totalXp: number
  wordsToReviewCount: number
  recentQuizAccuracy: number | null
  continueLearning: ContinueLearningResponse | null
}
