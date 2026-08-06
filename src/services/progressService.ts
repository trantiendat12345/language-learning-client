import axiosClient from '../api/axiosClient'
import type { ApiResponse } from '../types/api'
import type { ProgressDashboardResponse } from '../types/progress'

async function getDashboard(): Promise<ProgressDashboardResponse> {
  const response = await axiosClient.get<ApiResponse<ProgressDashboardResponse>>('/api/progress/dashboard')
  return response.data.data
}

export default { getDashboard }
