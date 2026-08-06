// Mock data cho các phần Dashboard chưa có API thật (Achievement/Leaderboard thuộc Phase 2,
// xem docs/PROJECT_OVERVIEW.md mục 11 - chưa build ở Backend). Thay bằng service thật khi
// Backend triển khai, giữ nguyên shape interface để đổi ít code nhất có thể.

export interface WeeklyProgressDay {
  label: string
  minutes: number
}

export const weeklyProgressMock: WeeklyProgressDay[] = [
  { label: 'T2', minutes: 18 },
  { label: 'T3', minutes: 25 },
  { label: 'T4', minutes: 0 },
  { label: 'T5', minutes: 32 },
  { label: 'T6', minutes: 15 },
  { label: 'T7', minutes: 40 },
  { label: 'CN', minutes: 10 },
]

export interface AchievementPreview {
  id: number
  title: string
  icon: 'flame' | 'trophy' | 'star' | 'zap'
  unlocked: boolean
}

export const achievementsMock: AchievementPreview[] = [
  { id: 1, title: 'Chuỗi 7 ngày', icon: 'flame', unlocked: true },
  { id: 2, title: '1000 XP', icon: 'star', unlocked: true },
  { id: 3, title: 'Hoàn thành khoá đầu tiên', icon: 'trophy', unlocked: false },
  { id: 4, title: 'Học thần tốc', icon: 'zap', unlocked: false },
]

export interface LeaderboardEntry {
  rank: number
  displayName: string
  xp: number
  isCurrentUser?: boolean
}

export const leaderboardMock: LeaderboardEntry[] = [
  { rank: 1, displayName: 'Minh Anh', xp: 4820 },
  { rank: 2, displayName: 'Quốc Bảo', xp: 4390 },
  { rank: 3, displayName: 'Thu Hà', xp: 3950 },
]
