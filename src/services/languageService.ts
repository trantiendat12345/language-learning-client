import axiosClient from '../api/axiosClient'
import type { ApiResponse } from '../types/api'
import type { LanguageCreateRequest, LanguageResponse, LanguageUpdateRequest } from '../types/language'

async function getActiveLanguages(): Promise<LanguageResponse[]> {
  const response = await axiosClient.get<ApiResponse<LanguageResponse[]>>('/api/languages')
  return response.data.data
}

async function getAllLanguagesForAdmin(): Promise<LanguageResponse[]> {
  const response = await axiosClient.get<ApiResponse<LanguageResponse[]>>('/api/admin/languages')
  return response.data.data
}

async function createLanguage(request: LanguageCreateRequest): Promise<LanguageResponse> {
  const response = await axiosClient.post<ApiResponse<LanguageResponse>>('/api/admin/languages', request)
  return response.data.data
}

async function updateLanguage(id: number, request: LanguageUpdateRequest): Promise<LanguageResponse> {
  const response = await axiosClient.put<ApiResponse<LanguageResponse>>(`/api/admin/languages/${id}`, request)
  return response.data.data
}

async function deleteLanguage(id: number): Promise<void> {
  await axiosClient.delete(`/api/admin/languages/${id}`)
}

export default { getActiveLanguages, getAllLanguagesForAdmin, createLanguage, updateLanguage, deleteLanguage }
