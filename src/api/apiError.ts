import { AxiosError } from 'axios'
import type { ApiErrorResponse } from '../types/api'

/** Đọc message lỗi từ ApiErrorResponse Backend trả về, fallback message chung nếu không đọc được. */
export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined
    if (data?.message) {
      return data.message
    }
  }
  return 'Đã có lỗi xảy ra, vui lòng thử lại sau'
}
