// Khớp review/dto/request/ReviewSubmitRequest.java, response/ReviewSubmitResponse.java ở Backend.
// (ReviewTodayItemResponse sẽ thêm ở chunk Review sau, dùng cho GET /api/review/today.)

export type ReviewRating = 'FORGOT' | 'HARD' | 'GOOD' | 'EASY'

export type MasteryLevel = 'NEW' | 'LEARNING' | 'FAMILIAR' | 'MASTERED'

export interface ReviewSubmitRequest {
  rating: ReviewRating
}

export interface ReviewSubmitResponse {
  vocabularyId: number
  repetitionCount: number
  easeFactor: number
  intervalDays: number
  nextReviewDate: string
  lastReviewDate: string | null
  forgotCount: number
  masteryLevel: MasteryLevel
}
