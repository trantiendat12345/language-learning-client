// Khớp user/entity/User.java (qua UserResponse), user/dto/request/UserUpdateRequest.java,
// ChangePasswordRequest.java ở Backend.

import type { DailyGoalType } from './progress'

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
  dailyGoalType: DailyGoalType
  dailyGoalValue: number
  status: UserStatus
}

// dailyGoalType/dailyGoalValue bắt buộc ở Backend (@NotNull/int primitive) - PUT /api/users/me
// phải luôn gửi kèm 2 field này dù người dùng không đổi mục tiêu, không phải optional.
export interface UserUpdateRequest {
  displayName?: string
  avatarUrl?: string
  birthday?: string
  gender?: string
  country?: string
  currentLevel?: string
  dailyGoalType: DailyGoalType
  dailyGoalValue: number
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
