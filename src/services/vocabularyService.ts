import axiosClient from '../api/axiosClient'
import type { ApiResponse, PageResponse } from '../types/api'
import type {
  VocabularyCreateRequest,
  VocabularyResponse,
  VocabularySummaryResponse,
  VocabularyUpdateRequest,
} from '../types/vocabulary'

async function getVocabularyById(id: number): Promise<VocabularyResponse> {
  const response = await axiosClient.get<ApiResponse<VocabularyResponse>>(`/api/vocabularies/${id}`)
  return response.data.data
}

// Tìm kiếm từ hệ thống theo keyword (public, chỉ trả owner=null + status=ACTIVE) - dùng làm
// nguồn tìm từ để gắn vào Lesson ở Admin, vì GET /api/admin/vocabularies không hỗ trợ keyword.
async function searchVocabularies(params: { keyword?: string; languageId?: number; page?: number; size?: number } = {}): Promise<
  PageResponse<VocabularySummaryResponse>
> {
  const response = await axiosClient.get<ApiResponse<PageResponse<VocabularySummaryResponse>>>('/api/vocabularies', { params })
  return response.data.data
}

async function getAllVocabulariesForAdmin(params: { page?: number; size?: number } = {}): Promise<
  PageResponse<VocabularySummaryResponse>
> {
  const response = await axiosClient.get<ApiResponse<PageResponse<VocabularySummaryResponse>>>('/api/admin/vocabularies', { params })
  return response.data.data
}

async function getVocabularyByIdForAdmin(id: number): Promise<VocabularyResponse> {
  const response = await axiosClient.get<ApiResponse<VocabularyResponse>>(`/api/admin/vocabularies/${id}`)
  return response.data.data
}

async function createVocabulary(request: VocabularyCreateRequest): Promise<VocabularyResponse> {
  const response = await axiosClient.post<ApiResponse<VocabularyResponse>>('/api/admin/vocabularies', request)
  return response.data.data
}

async function updateVocabulary(id: number, request: VocabularyUpdateRequest): Promise<VocabularyResponse> {
  const response = await axiosClient.put<ApiResponse<VocabularyResponse>>(`/api/admin/vocabularies/${id}`, request)
  return response.data.data
}

async function deleteVocabulary(id: number): Promise<void> {
  await axiosClient.delete(`/api/admin/vocabularies/${id}`)
}

export default {
  getVocabularyById,
  searchVocabularies,
  getAllVocabulariesForAdmin,
  getVocabularyByIdForAdmin,
  createVocabulary,
  updateVocabulary,
  deleteVocabulary,
}
