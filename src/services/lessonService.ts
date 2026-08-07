import axiosClient from '../api/axiosClient'
import type { ApiResponse } from '../types/api'
import type { LessonResponse } from '../types/lesson'
import type { LessonCompleteResponse } from '../types/progress'

async function getLessonById(id: number): Promise<LessonResponse> {
  const response = await axiosClient.get<ApiResponse<LessonResponse>>(`/api/lessons/${id}`)
  return response.data.data
}

async function completeLesson(id: number): Promise<LessonCompleteResponse> {
  const response = await axiosClient.post<ApiResponse<LessonCompleteResponse>>(`/api/lessons/${id}/complete`)
  return response.data.data
}

export default { getLessonById, completeLesson }
