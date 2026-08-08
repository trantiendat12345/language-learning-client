import axiosClient from '../api/axiosClient'
import type { ApiResponse, PageResponse } from '../types/api'
import type { CourseCreateRequest, CourseResponse, CourseSummaryResponse, CourseUpdateRequest } from '../types/course'
import type { CourseEnrollmentResponse } from '../types/progress'
import type { LessonCreateRequest, LessonResponse } from '../types/lesson'

export interface GetCoursesParams {
  languageId?: number
  level?: string
  keyword?: string
  page?: number
  size?: number
}

async function getCourses(params: GetCoursesParams = {}): Promise<PageResponse<CourseSummaryResponse>> {
  const response = await axiosClient.get<ApiResponse<PageResponse<CourseSummaryResponse>>>('/api/courses', {
    params,
  })
  return response.data.data
}

async function getCourseById(id: number): Promise<CourseResponse> {
  const response = await axiosClient.get<ApiResponse<CourseResponse>>(`/api/courses/${id}`)
  return response.data.data
}

async function enrollInCourse(id: number): Promise<CourseEnrollmentResponse> {
  const response = await axiosClient.post<ApiResponse<CourseEnrollmentResponse>>(`/api/courses/${id}/enroll`)
  return response.data.data
}

async function getAllCoursesForAdmin(params: { page?: number; size?: number } = {}): Promise<PageResponse<CourseSummaryResponse>> {
  const response = await axiosClient.get<ApiResponse<PageResponse<CourseSummaryResponse>>>('/api/admin/courses', { params })
  return response.data.data
}

async function getCourseByIdForAdmin(id: number): Promise<CourseResponse> {
  const response = await axiosClient.get<ApiResponse<CourseResponse>>(`/api/admin/courses/${id}`)
  return response.data.data
}

async function createCourse(request: CourseCreateRequest): Promise<CourseResponse> {
  const response = await axiosClient.post<ApiResponse<CourseResponse>>('/api/admin/courses', request)
  return response.data.data
}

async function updateCourse(id: number, request: CourseUpdateRequest): Promise<CourseResponse> {
  const response = await axiosClient.put<ApiResponse<CourseResponse>>(`/api/admin/courses/${id}`, request)
  return response.data.data
}

async function deleteCourse(id: number): Promise<void> {
  await axiosClient.delete(`/api/admin/courses/${id}`)
}

async function createLesson(courseId: number, request: LessonCreateRequest): Promise<LessonResponse> {
  const response = await axiosClient.post<ApiResponse<LessonResponse>>(`/api/admin/courses/${courseId}/lessons`, request)
  return response.data.data
}

export default {
  getCourses,
  getCourseById,
  enrollInCourse,
  getAllCoursesForAdmin,
  getCourseByIdForAdmin,
  createCourse,
  updateCourse,
  deleteCourse,
  createLesson,
}
