// Khớp lesson/dto/response/LessonSummaryResponse.java ở Backend.

export type LessonStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export interface LessonSummaryResponse {
  id: number
  title: string
  displayOrder: number
  estimatedMinutes: number | null
  status: LessonStatus
}
