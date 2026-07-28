// Khớp user/entity/User.java (qua UserResponse), user/dto/request/UserUpdateRequest.java,
// ChangePasswordRequest.java ở Backend.

export type UserStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'DISABLED' | 'LOCKED'

export interface UserResponse {
  id: number
  username: string
  email: string
  displayName: string | null
  avatarUrl: string | null
  birthday: string | null
  gender: string | null
  country: string | null
  currentLevel: string | null
  xp: number
  currentStreak: number
  longestStreak: number
  coin: number
  timezone: string
  status: UserStatus
}

export interface UserUpdateRequest {
  displayName?: string
  avatarUrl?: string
  birthday?: string
  gender?: string
  country?: string
  currentLevel?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
