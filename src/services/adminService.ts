import axiosClient from '../api/axiosClient'
import type { ApiResponse, PageResponse } from '../types/api'
import type { AdminDashboardResponse, AdminUserProgressResponse } from '../types/admin'
import type { UserResponse } from '../types/user'

async function getDashboard(): Promise<AdminDashboardResponse> {
  const response = await axiosClient.get<ApiResponse<AdminDashboardResponse>>('/api/admin/dashboard')
  return response.data.data
}

async function getUsers(params: { keyword?: string; page?: number; size?: number } = {}): Promise<PageResponse<UserResponse>> {
  const response = await axiosClient.get<ApiResponse<PageResponse<UserResponse>>>('/api/admin/users', { params })
  return response.data.data
}

async function getUserById(id: number): Promise<UserResponse> {
  const response = await axiosClient.get<ApiResponse<UserResponse>>(`/api/admin/users/${id}`)
  return response.data.data
}

async function getUserProgress(id: number): Promise<AdminUserProgressResponse> {
  const response = await axiosClient.get<ApiResponse<AdminUserProgressResponse>>(`/api/admin/users/${id}/progress`)
  return response.data.data
}

async function activateUser(id: number): Promise<UserResponse> {
  const response = await axiosClient.put<ApiResponse<UserResponse>>(`/api/admin/users/${id}/activate`)
  return response.data.data
}

async function disableUser(id: number): Promise<UserResponse> {
  const response = await axiosClient.put<ApiResponse<UserResponse>>(`/api/admin/users/${id}/disable`)
  return response.data.data
}

async function lockUser(id: number): Promise<UserResponse> {
  const response = await axiosClient.put<ApiResponse<UserResponse>>(`/api/admin/users/${id}/lock`)
  return response.data.data
}

export default { getDashboard, getUsers, getUserById, getUserProgress, activateUser, disableUser, lockUser }
