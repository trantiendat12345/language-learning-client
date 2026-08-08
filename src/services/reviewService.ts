import axiosClient from '../api/axiosClient'
import type { ApiResponse } from '../types/api'
import type { ReviewRating, ReviewSubmitResponse, ReviewTodayItemResponse } from '../types/review'

async function submitReview(vocabularyId: number, rating: ReviewRating): Promise<ReviewSubmitResponse> {
  const response = await axiosClient.post<ApiResponse<ReviewSubmitResponse>>(`/api/review/${vocabularyId}`, {
    rating,
  })
  return response.data.data
}

async function getTodayReview(): Promise<ReviewTodayItemResponse[]> {
  const response = await axiosClient.get<ApiResponse<ReviewTodayItemResponse[]>>('/api/review/today')
  return response.data.data
}

export default { submitReview, getTodayReview }
