// Khớp vocabulary/dto/response/VocabularyResponse.java, VocabularySummaryResponse.java ở Backend.

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
