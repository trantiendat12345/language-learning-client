// Khớp quiz/dto/request/QuizGenerateRequest.java, QuizSubmitRequest.java, QuizAnswerRequest.java,
// response/QuizGenerateResponse.java, QuizQuestionResponse.java, QuizOptionResponse.java,
// QuizAttemptResponse.java, QuizAttemptAnswerResponse.java, QuizAttemptSummaryResponse.java ở Backend.

export type QuestionSourceType = 'LESSON' | 'COURSE' | 'DECK' | 'VOCAB_LIST'

export type QuestionType =
  | 'MULTIPLE_CHOICE'
  | 'FILL_BLANK'
  | 'TYPING'
  | 'LISTENING'
  | 'MATCHING'
  | 'REORDER'
  | 'IMAGE_CHOICE'
  | 'AUDIO_CHOICE'

export interface QuizOptionResponse {
  id: number
  optionText: string | null
  optionImageUrl: string | null
}

// Không có field đúng/sai - đáp án đúng chỉ lộ ra sau khi nộp bài (QuizAttemptAnswerResponse).
export interface QuizQuestionResponse {
  id: number
  type: QuestionType
  promptText: string | null
  promptAudioUrl: string | null
  promptImageUrl: string | null
  options: QuizOptionResponse[]
}

export interface QuizGenerateRequest {
  sourceType: QuestionSourceType
  sourceId: number
  questionCount?: number
}

export interface QuizGenerateResponse {
  questions: QuizQuestionResponse[]
  requestedCount: number
  actualCount: number
}

// selectedOptionId/typedAnswer đều để trống nghĩa là bỏ qua câu này (tính sai, không lỗi).
export interface QuizAnswerRequest {
  questionId: number
  selectedOptionId?: number
  typedAnswer?: string
}

export interface QuizSubmitRequest {
  sourceType: QuestionSourceType
  sourceId: number
  durationSeconds: number
  answers: QuizAnswerRequest[]
}

// correctOptionId chỉ là id (không có text) - với FILL_BLANK/TYPING không thể hiển thị đáp án đúng
// dạng chữ vì Backend không trả text của option ẩn danh đó.
export interface QuizAttemptAnswerResponse {
  questionId: number
  type: QuestionType
  promptText: string | null
  explanation: string | null
  selectedOptionId: number | null
  typedAnswer: string | null
  correctOptionId: number | null
  correct: boolean
}

export interface QuizAttemptResponse {
  id: number
  sourceType: QuestionSourceType
  sourceId: number
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  score: number
  accuracy: number
  durationSeconds: number
  xpEarned: number
  completedAt: string
  answers: QuizAttemptAnswerResponse[]
}

export interface QuizAttemptSummaryResponse {
  id: number
  sourceType: QuestionSourceType
  sourceId: number
  totalQuestions: number
  correctAnswers: number
  accuracy: number
  completedAt: string
}
