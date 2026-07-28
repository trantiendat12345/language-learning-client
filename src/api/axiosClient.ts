import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { getAccessToken, notifyAuthFailure, setAccessToken } from './tokenStore'
import type { ApiResponse } from '../types/api'
import type { AccessTokenResponse } from '../types/auth'

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Bắt buộc để trình duyệt gửi kèm cookie refreshToken httpOnly cho /api/auth/refresh-token
  // (xem docs/PROJECT_OVERVIEW.md mục 8) - Backend CorsConfig chỉ allowCredentials cho đúng
  // origin cấu hình ở FRONTEND_URL, không dùng "*".
  withCredentials: true,
})

axiosClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Gom các request bị 401 trong lúc đang refresh lại 1 chỗ, tránh gọi /refresh-token nhiều lần
// song song khi nhiều request cùng fail 401 gần như đồng thời.
let isRefreshing = false
let pendingRequests: Array<(token: string | null) => void> = []

function subscribeTokenRefresh(callback: (token: string | null) => void) {
  pendingRequests.push(callback)
}

function onTokenRefreshed(token: string | null) {
  pendingRequests.forEach((callback) => callback(token))
  pendingRequests = []
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined
    const status = error.response?.status
    // Không thử refresh cho chính các endpoint /api/auth/** - login/register trả 401 là lỗi
    // nghiệp vụ thật (sai mật khẩu...), refresh-token/verify-email/reset-password trả 401 vì lý
    // do khác hoàn toàn accessToken hết hạn nên refresh lại cũng không giải quyết được gì.
    const isAuthEndpoint = originalRequest?.url?.includes('/api/auth/')

    if (status !== 401 || !originalRequest || originalRequest._retry || isAuthEndpoint) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((token) => {
          if (!token) {
            reject(error)
            return
          }
          originalRequest.headers.Authorization = `Bearer ${token}`
          resolve(axiosClient(originalRequest))
        })
      })
    }

    isRefreshing = true
    try {
      const response = await axiosClient.post<ApiResponse<AccessTokenResponse>>('/api/auth/refresh-token')
      const newToken = response.data.data.accessToken
      setAccessToken(newToken)
      onTokenRefreshed(newToken)
      originalRequest.headers.Authorization = `Bearer ${newToken}`
      return axiosClient(originalRequest)
    } catch (refreshError) {
      setAccessToken(null)
      onTokenRefreshed(null)
      notifyAuthFailure()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default axiosClient
