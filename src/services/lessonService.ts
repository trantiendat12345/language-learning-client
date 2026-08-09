import axiosClient from '../api/axiosClient'
import type { ApiResponse } from '../types/api'
import type { LessonResponse, LessonUpdateRequest, LessonVocabularyAttachRequest } from '../types/lesson'
import type { LessonCompleteResponse } from '../types/progress'

async function getLessonById(id: number): Promise<LessonResponse> {
  const response = await axiosClient.get<ApiResponse<LessonResponse>>(`/api/lessons/${id}`)
  return response.data.data
}

async function completeLesson(id: number): Promise<LessonCompleteResponse> {
  const response = await axiosClient.post<ApiResponse<LessonCompleteResponse>>(`/api/lessons/${id}/complete`)
  return response.data.data
}

async function getLessonByIdForAdmin(id: number): Promise<LessonResponse> {
  const response = await axiosClient.get<ApiResponse<LessonResponse>>(`/api/admin/lessons/${id}`)
  return response.data.data
}

async function updateLesson(id: number, request: LessonUpdateRequest): Promise<LessonResponse> {
  const response = await axiosClient.put<ApiResponse<LessonResponse>>(`/api/admin/lessons/${id}`, request)
  return response.data.data
}

async function deleteLesson(id: number): Promise<void> {
  await axiosClient.delete(`/api/admin/lessons/${id}`)
}

async function attachVocabulary(lessonId: number, request: LessonVocabularyAttachRequest): Promise<void> {
  await axiosClient.post(`/api/admin/lessons/${lessonId}/vocabularies`, request)
}

async function detachVocabulary(lessonId: number, vocabularyId: number): Promise<void> {
  await axiosClient.delete(`/api/admin/lessons/${lessonId}/vocabularies/${vocabularyId}`)
}

export default {
  getLessonById,
  completeLesson,
  getLessonByIdForAdmin,
  updateLesson,
  deleteLesson,
  attachVocabulary,
  detachVocabulary,
}
