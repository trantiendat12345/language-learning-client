import axiosClient from '../api/axiosClient'
import type { ApiResponse, PageResponse } from '../types/api'
import type { CourseResponse, CourseSummaryResponse } from '../types/course'
import type { CourseEnrollmentResponse } from '../types/progress'

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

export default { getCourses, getCourseById, enrollInCourse }
