import axiosClient from '../api/axiosClient'
import type { ApiResponse, PageResponse } from '../types/api'
import type {
  QuizAttemptResponse,
  QuizAttemptSummaryResponse,
  QuizGenerateRequest,
  QuizGenerateResponse,
  QuizSubmitRequest,
} from '../types/quiz'

async function generateQuiz(request: QuizGenerateRequest): Promise<QuizGenerateResponse> {
  const response = await axiosClient.post<ApiResponse<QuizGenerateResponse>>('/api/quizzes/generate', request)
  return response.data.data
}

async function submitQuiz(request: QuizSubmitRequest): Promise<QuizAttemptResponse> {
  const response = await axiosClient.post<ApiResponse<QuizAttemptResponse>>('/api/quizzes/attempts', request)
  return response.data.data
}

async function getAttempts(params: { page?: number; size?: number } = {}): Promise<PageResponse<QuizAttemptSummaryResponse>> {
  const response = await axiosClient.get<ApiResponse<PageResponse<QuizAttemptSummaryResponse>>>('/api/quizzes/attempts', {
    params,
  })
  return response.data.data
}

async function getAttemptById(id: number): Promise<QuizAttemptResponse> {
  const response = await axiosClient.get<ApiResponse<QuizAttemptResponse>>(`/api/quizzes/attempts/${id}`)
  return response.data.data
}

export default { generateQuiz, submitQuiz, getAttempts, getAttemptById }
