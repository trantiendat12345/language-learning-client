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
