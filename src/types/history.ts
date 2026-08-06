// Khớp history/dto/response/ActivityHistoryResponse.java ở Backend.

export type ActivityTargetType = 'COURSE' | 'LESSON' | 'DECK' | 'VOCABULARY'
export type ActivityAction = 'VIEWED' | 'LEARNED' | 'REVIEWED'

export interface ActivityHistoryResponse {
  id: number
  targetType: ActivityTargetType
  targetId: number
  /** null nếu đối tượng gốc đã bị xoá mềm/không còn tồn tại - vẫn hiển thị dòng log, không ẩn. */
  title: string | null
  action: ActivityAction
  occurredAt: string
}
