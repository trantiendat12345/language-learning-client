// Khớp admin/dto/response/AdminDashboardResponse.java, user/dto/response/AdminUserProgressResponse.java ở Backend.

import type { CourseEnrollmentResponse } from './progress'

export interface AdminDashboardResponse {
  totalUsers: number
  activeUsers: number
  totalCourses: number
  totalLessons: number
  totalVocabulary: number
  totalDecks: number
  totalQuizAttempts: number
}

export interface AdminUserProgressResponse {
  userId: number
  username: string
  xp: number
  currentStreak: number
  longestStreak: number
  courseEnrollments: CourseEnrollmentResponse[]
}
