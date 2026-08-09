import type { QuestionSourceType, QuestionType } from '../../types/quiz'
import type { QuestionCreateRequest } from '../../types/question'

export interface QuestionFormValues {
  sourceType: QuestionSourceType
  sourceId: string
  languageId: string
  type: QuestionType
  vocabularyId: string
  promptText: string
  promptAudioUrl: string
  promptImageUrl: string
  explanation: string
  difficulty: string
  options: { optionText: string; optionImageUrl: string; correct: boolean }[]
}

export const EMPTY_QUESTION_FORM: QuestionFormValues = {
  sourceType: 'LESSON',
  sourceId: '',
  languageId: '',
  type: 'MULTIPLE_CHOICE',
  vocabularyId: '',
  promptText: '',
  promptAudioUrl: '',
  promptImageUrl: '',
  explanation: '',
  difficulty: '',
  options: [],
}

export const SOURCE_TYPE_LABELS: Record<QuestionSourceType, string> = {
  LESSON: 'Bài học',
  COURSE: 'Khoá học',
  DECK: 'Deck',
  VOCAB_LIST: 'Danh sách từ vựng',
}

// LISTENING/MATCHING/REORDER tạo được (đủ 8 loại theo ERD) nhưng QuizServiceImpl.submitQuiz
// chưa chấm điểm đúng cho các loại này (Phase 2) - xem comment tại QuestionType.java.
export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  MULTIPLE_CHOICE: 'Trắc nghiệm',
  FILL_BLANK: 'Điền vào chỗ trống',
  TYPING: 'Gõ đáp án',
  IMAGE_CHOICE: 'Chọn theo hình',
  AUDIO_CHOICE: 'Chọn theo âm thanh',
  LISTENING: 'Nghe (chưa chấm điểm tự động)',
  MATCHING: 'Nối cặp (chưa chấm điểm tự động)',
  REORDER: 'Sắp xếp lại (chưa chấm điểm tự động)',
}

export function toQuestionRequest(data: QuestionFormValues): QuestionCreateRequest {
  return {
    sourceType: data.sourceType,
    sourceId: Number(data.sourceId),
    languageId: Number(data.languageId),
    type: data.type,
    vocabularyId: data.vocabularyId ? Number(data.vocabularyId) : undefined,
    promptText: data.promptText || undefined,
    promptAudioUrl: data.promptAudioUrl || undefined,
    promptImageUrl: data.promptImageUrl || undefined,
    explanation: data.explanation || undefined,
    difficulty: data.difficulty || undefined,
    options: data.options
      .filter((o) => o.optionText.trim())
      .map((o, index) => ({
        optionText: o.optionText,
        optionImageUrl: o.optionImageUrl || undefined,
        correct: o.correct,
        displayOrder: index,
      })),
  }
}
