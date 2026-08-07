import axiosClient from '../api/axiosClient'
import type { ApiResponse } from '../types/api'
import type { ReviewRating, ReviewSubmitResponse } from '../types/review'

async function submitReview(vocabularyId: number, rating: ReviewRating): Promise<ReviewSubmitResponse> {
  const response = await axiosClient.post<ApiResponse<ReviewSubmitResponse>>(`/api/review/${vocabularyId}`, {
    rating,
  })
  return response.data.data
}

export default { submitReview }
