// Khớp common/dto/ImportResult.java, ImportRowError.java ở Backend - dùng chung cho Import
// Vocabulary hệ thống (Admin) và Import Deck Card (User).

export interface ImportRowError {
  row: number
  column: string
  message: string
}

export interface ImportResult {
  success: boolean
  totalRows: number
  importedCount: number
  errors: ImportRowError[]
}
