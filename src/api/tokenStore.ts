// Access token lưu in-memory (module-level, KHÔNG localStorage) — xem
// docs/PROJECT_OVERVIEW.md mục 8. axiosClient interceptor đọc token từ đây thay vì từ
// React Context vì interceptor chạy ngoài component tree, không dùng hook được.

type AuthFailureListener = () => void

let accessToken: string | null = null
let authFailureListener: AuthFailureListener | null = null

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string | null): void {
  accessToken = token
}

/** AuthContext đăng ký listener này để clear state khi refresh token thất bại (xem axiosClient). */
export function setAuthFailureListener(listener: AuthFailureListener | null): void {
  authFailureListener = listener
}

export function notifyAuthFailure(): void {
  authFailureListener?.()
}
