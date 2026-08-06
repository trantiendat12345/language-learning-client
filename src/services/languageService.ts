import axiosClient from '../api/axiosClient'
import type { ApiResponse } from '../types/api'
import type { LanguageResponse } from '../types/language'

async function getActiveLanguages(): Promise<LanguageResponse[]> {
  const response = await axiosClient.get<ApiResponse<LanguageResponse[]>>('/api/languages')
  return response.data.data
}

export default { getActiveLanguages }
