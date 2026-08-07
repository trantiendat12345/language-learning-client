// Khớp lesson/dto/response/LessonSummaryResponse.java, LessonResponse.java,
// LessonVocabularyResponse.java ở Backend.

import type { GrammarResponse } from './grammar'

export type LessonStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export interface LessonSummaryResponse {
  id: number
  title: string
  displayOrder: number
  estimatedMinutes: number | null
  status: LessonStatus
}

/** Vocabulary như được gắn vào 1 Lesson cụ thể (kèm displayOrder theo bảng join LessonVocabulary). */
export interface LessonVocabularyResponse {
  vocabularyId: number
  word: string
  meaning: string
  ipa: string | null
  imageUrl: string | null
  wordType: string | null
  displayOrder: number
}

/**
 * Đầy đủ cho GET /api/lessons/{id}. `enrolled=true` (đã enroll Course chứa Lesson này) →
 * vocabularies/grammars có đầy đủ nội dung; `enrolled=false` (chưa login hoặc chưa enroll) →
 * 2 field đó rỗng (preview) - phân biệt với "Lesson thật sự chưa có nội dung" bằng field này.
 */
export interface LessonResponse {
  id: number
  courseId: number
  title: string
  description: string | null
  displayOrder: number
  videoUrl: string | null
  audioUrl: string | null
  estimatedMinutes: number | null
  status: LessonStatus
  enrolled: boolean
  vocabularies: LessonVocabularyResponse[]
  grammars: GrammarResponse[]
}
