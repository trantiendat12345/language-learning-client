import axiosClient from '../api/axiosClient'
import type { ApiResponse } from '../types/api'
import type { VocabularyResponse } from '../types/vocabulary'

async function getVocabularyById(id: number): Promise<VocabularyResponse> {
  const response = await axiosClient.get<ApiResponse<VocabularyResponse>>(`/api/vocabularies/${id}`)
  return response.data.data
}

export default { getVocabularyById }
