// Khớp grammar/dto/response/GrammarResponse.java, GrammarExampleResponse.java,
// GrammarSummaryResponse.java, request/GrammarCreateRequest.java, GrammarUpdateRequest.java,
// GrammarExampleRequest.java ở Backend.

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

/** Rút gọn cho GET /api/admin/lessons/{lessonId}/grammars - không có explanation/example. */
export interface GrammarSummaryResponse {
  id: number
  title: string
  pattern: string | null
  difficulty: string | null
  displayOrder: number
}

export interface GrammarExampleRequest {
  exampleText: string
  translation?: string
  note?: string
}

// lessonId lấy từ path (POST /api/admin/lessons/{lessonId}/grammars), không nằm trong body.
export interface GrammarCreateRequest {
  title: string
  pattern?: string
  explanation?: string
  difficulty?: string
  displayOrder: number
  examples: GrammarExampleRequest[]
}

// Update = thay toàn bộ danh sách example, không sửa/xoá từng example riêng lẻ.
export interface GrammarUpdateRequest {
  title: string
  pattern?: string
  explanation?: string
  difficulty?: string
  displayOrder: number
  examples: GrammarExampleRequest[]
}
