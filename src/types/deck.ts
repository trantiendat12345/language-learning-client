// Khớp deck/dto/response/DeckResponse.java, DeckSummaryResponse.java, DeckCardResponse.java,
// request/DeckCreateRequest.java, DeckUpdateRequest.java, DeckCardAddRequest.java ở Backend.

export type DeckVisibility = 'PRIVATE' | 'PUBLIC'
export type DeckStatus = 'ACTIVE' | 'ARCHIVED'

export interface DeckSummaryResponse {
  id: number
  title: string
  coverImageUrl: string | null
  languageCode: string
  visibility: DeckVisibility
  status: DeckStatus
  cardCount: number
}

export interface DeckResponse {
  id: number
  ownerId: number
  languageId: number
  languageCode: string
  title: string
  description: string | null
  coverImageUrl: string | null
  visibility: DeckVisibility
  clonedFromDeckId: number | null
  status: DeckStatus
  cardCount: number
}

export interface DeckCardResponse {
  id: number
  vocabularyId: number
  word: string
  meaning: string
  ipa: string | null
  imageUrl: string | null
  wordType: string | null
  displayOrder: number
}

export interface DeckCreateRequest {
  languageId: number
  title: string
  description?: string
  coverImageUrl?: string
  visibility?: DeckVisibility
}

export interface DeckUpdateRequest {
  title: string
  description?: string
  coverImageUrl?: string
  visibility: DeckVisibility
  status: DeckStatus
}

// 2 nhánh loại trừ nhau ở Backend: vocabularyId (từ có sẵn) HOẶC word+meaning (tạo từ mới).
export interface DeckCardAddRequest {
  vocabularyId?: number
  word?: string
  meaning?: string
  ipa?: string
  imageUrl?: string
  exampleSentence?: string
  exampleTranslation?: string
  displayOrder?: number
}
