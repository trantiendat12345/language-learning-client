import axiosClient from '../api/axiosClient'
import type { ApiResponse } from '../types/api'
import type {
  AccessTokenResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from '../types/auth'
import type { UserResponse } from '../types/user'

async function register(data: RegisterRequest): Promise<UserResponse> {
  const response = await axiosClient.post<ApiResponse<UserResponse>>('/api/auth/register', data)
  return response.data.data
}

async function login(data: LoginRequest): Promise<AccessTokenResponse> {
  const response = await axiosClient.post<ApiResponse<AccessTokenResponse>>('/api/auth/login', data)
  return response.data.data
}

async function logout(): Promise<void> {
  await axiosClient.post('/api/auth/logout')
}

async function refreshToken(): Promise<AccessTokenResponse> {
  const response = await axiosClient.post<ApiResponse<AccessTokenResponse>>('/api/auth/refresh-token')
  return response.data.data
}

async function forgotPassword(data: ForgotPasswordRequest): Promise<void> {
  await axiosClient.post('/api/auth/forgot-password', data)
}

async function resetPassword(data: ResetPasswordRequest): Promise<void> {
  await axiosClient.post('/api/auth/reset-password', data)
}

async function verifyEmail(token: string): Promise<void> {
  await axiosClient.get('/api/auth/verify-email', { params: { token } })
}

export default { register, login, logout, refreshToken, forgotPassword, resetPassword, verifyEmail }
