// Khớp grammar/dto/response/GrammarResponse.java, GrammarExampleResponse.java ở Backend.

export interface GrammarExampleResponse {
  id: number
  exampleText: string
  translation: string | null
  note: string | null
}

/** Đầy đủ cho GET /api/admin/grammars/{id} và nhúng vào LessonResponse - kèm toàn bộ example. */
export interface GrammarResponse {
  id: number
  lessonId: number
  title: string
  pattern: string | null
  explanation: string | null
  difficulty: string | null
  displayOrder: number
  examples: GrammarExampleResponse[]
}
