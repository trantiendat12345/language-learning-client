import axiosClient from '../api/axiosClient'
import type { ApiResponse } from '../types/api'
import type { ActivityAction, ActivityHistoryResponse } from '../types/history'

export interface GetRecentHistoryParams {
  action?: ActivityAction
  limit?: number
}

async function getRecentHistory(params: GetRecentHistoryParams = {}): Promise<ActivityHistoryResponse[]> {
  const response = await axiosClient.get<ApiResponse<ActivityHistoryResponse[]>>('/api/history/recent', { params })
  return response.data.data
}

export default { getRecentHistory }
