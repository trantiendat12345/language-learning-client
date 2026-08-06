// Khớp course/dto/response/CourseResponse.java, CourseSummaryResponse.java ở Backend.

import type { LessonSummaryResponse } from './lesson'

export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export interface CourseSummaryResponse {
  id: number
  languageCode: string
  title: string
  slug: string
  thumbnailUrl: string | null
  difficulty: string | null
  estimatedMinutes: number | null
  status: CourseStatus
}

/** Đầy đủ cho GET /api/courses/{id} - kèm danh sách Lesson theo displayOrder. */
export interface CourseResponse {
  id: number
  languageId: number
  languageCode: string
  languageName: string
  title: string
  slug: string
  description: string | null
  thumbnailUrl: string | null
  difficulty: string | null
  estimatedMinutes: number | null
  displayOrder: number
  status: CourseStatus
  lessons: LessonSummaryResponse[]
}
