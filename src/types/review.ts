// Khớp review/dto/request/ReviewSubmitRequest.java, response/ReviewSubmitResponse.java,
// ReviewTodayItemResponse.java ở Backend.

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

// 1 item trong GET /api/review/today - từ có nextReviewDate <= hôm nay (theo timezone user),
// sort quá hạn lâu nhất trước.
export interface ReviewTodayItemResponse {
  vocabularyId: number
  word: string
  meaning: string
  ipa: string | null
  imageUrl: string | null
  wordType: string | null
  nextReviewDate: string
  masteryLevel: MasteryLevel
}
