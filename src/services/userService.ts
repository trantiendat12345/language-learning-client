import axiosClient from '../api/axiosClient'
import type { ApiResponse } from '../types/api'
import type { ChangePasswordRequest, UserResponse, UserUpdateRequest } from '../types/user'

async function getMyProfile(): Promise<UserResponse> {
  const response = await axiosClient.get<ApiResponse<UserResponse>>('/api/users/me')
  return response.data.data
}

async function updateMyProfile(data: UserUpdateRequest): Promise<UserResponse> {
  const response = await axiosClient.put<ApiResponse<UserResponse>>('/api/users/me', data)
  return response.data.data
}

async function changePassword(data: ChangePasswordRequest): Promise<void> {
  await axiosClient.put('/api/users/me/password', data)
}

export default { getMyProfile, updateMyProfile, changePassword }
