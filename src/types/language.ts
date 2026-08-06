// Khớp language/dto/response/LanguageResponse.java ở Backend.

export type LanguageStatus = 'ACTIVE' | 'INACTIVE'

export interface LanguageResponse {
  id: number
  code: string
  name: string
  flagIconUrl: string | null
  status: LanguageStatus
}
