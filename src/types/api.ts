// Khớp common/dto/ApiResponse.java và common/dto/ApiErrorResponse.java ở Backend.

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface FieldError {
  field: string
  message: string
}

export interface ApiErrorResponse {
  code: number
  errorCode: string
  message: string
  errors: FieldError[] | null
}

// Khớp common/dto/PageResponse.java ở Backend - bọc trong ApiResponse<PageResponse<T>> cho mọi API danh sách.
export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}
