import axiosClient from '../api/axiosClient'
import type { ApiResponse, PageResponse } from '../types/api'
import type { QuestionSourceType } from '../types/quiz'
import type { QuestionCreateRequest, QuestionResponse, QuestionSummaryResponse, QuestionUpdateRequest } from '../types/question'

async function getAllQuestionsForAdmin(
  params: { sourceType?: QuestionSourceType; sourceId?: number; page?: number; size?: number } = {},
): Promise<PageResponse<QuestionSummaryResponse>> {
  const response = await axiosClient.get<ApiResponse<PageResponse<QuestionSummaryResponse>>>('/api/admin/questions', { params })
  return response.data.data
}

async function getQuestionByIdForAdmin(id: number): Promise<QuestionResponse> {
  const response = await axiosClient.get<ApiResponse<QuestionResponse>>(`/api/admin/questions/${id}`)
  return response.data.data
}

async function createQuestion(request: QuestionCreateRequest): Promise<QuestionResponse> {
  const response = await axiosClient.post<ApiResponse<QuestionResponse>>('/api/admin/questions', request)
  return response.data.data
}

async function updateQuestion(id: number, request: QuestionUpdateRequest): Promise<QuestionResponse> {
  const response = await axiosClient.put<ApiResponse<QuestionResponse>>(`/api/admin/questions/${id}`, request)
  return response.data.data
}

async function deleteQuestion(id: number): Promise<void> {
  await axiosClient.delete(`/api/admin/questions/${id}`)
}

export default {
  getAllQuestionsForAdmin,
  getQuestionByIdForAdmin,
  createQuestion,
  updateQuestion,
  deleteQuestion,
}
