// Khớp auth/dto/request/RegisterRequest.java, LoginRequest.java, ForgotPasswordRequest.java,
// ResetPasswordRequest.java, auth/dto/response/AccessTokenResponse.java ở Backend.

export interface RegisterRequest {
  username: string
  email: string
  password: string
  confirmPassword: string
}

export interface LoginRequest {
  usernameOrEmail: string
  password: string
}

export interface ForgotPasswordRequest {
  email: string
}

// Lưu ý: field cuối là confirmNewPassword (khác ChangePasswordRequest dùng confirmPassword)
// - khớp chính xác ResetPasswordRequest.java phía Backend.
export interface ResetPasswordRequest {
  token: string
  newPassword: string
  confirmNewPassword: string
}

// AuthResponse.refreshToken có @JsonIgnore ở Backend nên không xuất hiện trong JSON -
// refreshToken chỉ nằm trong cookie httpOnly, FE không đọc/lưu được.
export interface AccessTokenResponse {
  accessToken: string
}
