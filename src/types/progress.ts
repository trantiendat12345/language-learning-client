// Khớp progress/dto/response/CourseEnrollmentResponse.java ở Backend.

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
