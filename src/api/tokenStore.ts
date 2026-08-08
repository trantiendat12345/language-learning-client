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

function base64UrlDecode(base64Url: string): string {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const decoded = atob(base64)
  return decodeURIComponent(
    decoded
      .split('')
      .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join(''),
  )
}

/**
 * Đọc claim "roles" từ payload JWT access token (chỉ decode, không verify signature - dùng để
 * hiện/ẩn UI, mọi enforcement quyền thật sự luôn nằm ở Backend SecurityConfig hasRole("ADMIN")).
 * Backend không có field role nào trong UserResponse/AuthResponse - đây là cách duy nhất FE biết
 * role hiện tại (xem JwtService.generateAccessToken claim "roles": List<String>).
 */
export function getRolesFromToken(token: string | null): string[] {
  if (!token) return []
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(base64UrlDecode(payload)) as { roles?: string[] }
    return decoded.roles ?? []
  } catch {
    return []
  }
}
