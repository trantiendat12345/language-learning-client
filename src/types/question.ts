// Khớp quiz/dto/request/QuestionCreateRequest.java, QuestionUpdateRequest.java, QuestionOptionRequest.java,
// response/QuestionResponse.java, QuestionSummaryResponse.java, QuestionOptionResponse.java ở Backend.
// QuestionSourceType/QuestionType đã có sẵn ở types/quiz.ts (dùng chung request Quiz + Admin).

import type { QuestionSourceType, QuestionType } from './quiz'

export interface QuestionOptionResponse {
  id: number
  optionText: string | null
  optionImageUrl: string | null
  correct: boolean
  displayOrder: number
}

/** Rút gọn cho danh sách GET /api/admin/questions — không có option/explanation. */
export interface QuestionSummaryResponse {
  id: number
  sourceType: QuestionSourceType
  sourceId: number
  type: QuestionType
  promptText: string | null
  difficulty: string | null
}

/** Đầy đủ cho GET /api/admin/questions/{id} — kèm toàn bộ option (có đáp án đúng). */
export interface QuestionResponse {
  id: number
  sourceType: QuestionSourceType
  sourceId: number
  languageId: number
  type: QuestionType
  vocabularyId: number | null
  promptText: string | null
  promptAudioUrl: string | null
  promptImageUrl: string | null
  explanation: string | null
  difficulty: string | null
  options: QuestionOptionResponse[]
}

export interface QuestionOptionRequest {
  optionText?: string
  optionImageUrl?: string
  correct: boolean
  displayOrder: number
}

export interface QuestionCreateRequest {
  sourceType: QuestionSourceType
  sourceId: number
  languageId: number
  type: QuestionType
  vocabularyId?: number
  promptText?: string
  promptAudioUrl?: string
  promptImageUrl?: string
  explanation?: string
  difficulty?: string
  options?: QuestionOptionRequest[]
}

export type QuestionUpdateRequest = QuestionCreateRequest
