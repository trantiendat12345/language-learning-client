import axiosClient from '../api/axiosClient'
import type { ApiResponse } from '../types/api'
import type { GrammarCreateRequest, GrammarResponse, GrammarUpdateRequest } from '../types/grammar'

async function createGrammar(lessonId: number, request: GrammarCreateRequest): Promise<GrammarResponse> {
  const response = await axiosClient.post<ApiResponse<GrammarResponse>>(`/api/admin/lessons/${lessonId}/grammars`, request)
  return response.data.data
}

async function updateGrammar(id: number, request: GrammarUpdateRequest): Promise<GrammarResponse> {
  const response = await axiosClient.put<ApiResponse<GrammarResponse>>(`/api/admin/grammars/${id}`, request)
  return response.data.data
}

async function deleteGrammar(id: number): Promise<void> {
  await axiosClient.delete(`/api/admin/grammars/${id}`)
}

export default { createGrammar, updateGrammar, deleteGrammar }
