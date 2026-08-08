// Khớp language/dto/response/LanguageResponse.java, request/LanguageCreateRequest.java,
// LanguageUpdateRequest.java ở Backend.

export type LanguageStatus = 'ACTIVE' | 'INACTIVE'

export interface LanguageResponse {
  id: number
  code: string
  name: string
  flagIconUrl: string | null
  status: LanguageStatus
}

// code chỉ set được lúc tạo, không sửa được sau đó (xem LanguageUpdateRequest phía dưới).
export interface LanguageCreateRequest {
  code: string
  name: string
  flagIconUrl?: string
}

export interface LanguageUpdateRequest {
  name: string
  flagIconUrl?: string
  status: LanguageStatus
}
