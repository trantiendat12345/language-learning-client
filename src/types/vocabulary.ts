// Khớp vocabulary/dto/response/VocabularyResponse.java, VocabularySummaryResponse.java,
// request/VocabularyCreateRequest.java, VocabularyUpdateRequest.java ở Backend.

export type VocabularyStatus = 'ACTIVE' | 'ARCHIVED'

export interface VocabularySummaryResponse {
  id: number
  languageCode: string
  word: string
  meaning: string
  ipa: string | null
  imageUrl: string | null
  wordType: string | null
  status: VocabularyStatus
}

export interface VocabularyResponse {
  id: number
  languageId: number
  languageCode: string
  languageName: string
  word: string
  meaning: string
  ipa: string | null
  pronunciationAudioUrl: string | null
  wordType: string | null
  imageUrl: string | null
  difficulty: string | null
  exampleSentence: string | null
  exampleTranslation: string | null
  frequencyRank: number | null
  status: VocabularyStatus
}

// Không có ownerId - Admin chỉ tạo từ hệ thống (owner luôn null).
export interface VocabularyCreateRequest {
  languageId: number
  word: string
  meaning: string
  ipa?: string
  pronunciationAudioUrl?: string
  wordType?: string
  imageUrl?: string
  difficulty?: string
  exampleSentence?: string
  exampleTranslation?: string
  frequencyRank?: number
}

export interface VocabularyUpdateRequest {
  languageId: number
  word: string
  meaning: string
  ipa?: string
  pronunciationAudioUrl?: string
  wordType?: string
  imageUrl?: string
  difficulty?: string
  exampleSentence?: string
  exampleTranslation?: string
  frequencyRank?: number
  status: VocabularyStatus
}
