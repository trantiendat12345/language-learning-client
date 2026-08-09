import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import questionService from '../../services/questionService'
import languageService from '../../services/languageService'
import { getApiErrorMessage } from '../../api/apiError'
import { Badge, Button, Card, Skeleton } from '../ui'
import QuestionForm, { type QuestionFormValues } from './QuestionForm'
import { EMPTY_QUESTION_FORM, QUESTION_TYPE_LABELS, toQuestionRequest } from './questionFormShared'
import type { QuestionResponse, QuestionSummaryResponse } from '../../types/question'
import type { LanguageResponse } from '../../types/language'
import styles from './LessonQuestionManager.module.scss'

export interface LessonQuestionManagerProps {
  lessonId: number
}

function toEditFormValues(detail: QuestionResponse): QuestionFormValues {
  return {
    sourceType: detail.sourceType,
    sourceId: String(detail.sourceId),
    languageId: String(detail.languageId),
    type: detail.type,
    vocabularyId: detail.vocabularyId != null ? String(detail.vocabularyId) : '',
    promptText: detail.promptText ?? '',
    promptAudioUrl: detail.promptAudioUrl ?? '',
    promptImageUrl: detail.promptImageUrl ?? '',
    explanation: detail.explanation ?? '',
    difficulty: detail.difficulty ?? '',
    options: detail.options.map((o) => ({
      optionText: o.optionText ?? '',
      optionImageUrl: o.optionImageUrl ?? '',
      correct: o.correct,
    })),
  }
}

// Question không nằm sẵn trong LessonResponse (khác Vocabulary/Grammar) - component tự fetch
// riêng theo sourceType=LESSON + sourceId=lessonId qua filter mới thêm ở GET /api/admin/questions.
function LessonQuestionManager({ lessonId }: LessonQuestionManagerProps) {
  const [languages, setLanguages] = useState<LanguageResponse[]>([])
  const [questions, setQuestions] = useState<QuestionSummaryResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editDefaults, setEditDefaults] = useState<QuestionFormValues | null>(null)
  const [isLoadingEdit, setIsLoadingEdit] = useState(false)
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    languageService.getActiveLanguages().then(setLanguages)
  }, [])

  useEffect(() => {
    let ignore = false

    async function load() {
      setIsLoading(true)
      setLoadError(null)
      try {
        const data = await questionService.getAllQuestionsForAdmin({ sourceType: 'LESSON', sourceId: lessonId, size: 100 })
        if (!ignore) setQuestions(data.content)
      } catch (error) {
        if (!ignore) setLoadError(getApiErrorMessage(error))
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    load()
    return () => {
      ignore = true
    }
  }, [lessonId])

  async function handleCreate(data: QuestionFormValues) {
    setIsCreating(true)
    setCreateError(null)
    try {
      const created = await questionService.createQuestion(toQuestionRequest(data))
      setQuestions((prev) => [
        ...prev,
        { id: created.id, sourceType: created.sourceType, sourceId: created.sourceId, type: created.type, promptText: created.promptText, difficulty: created.difficulty },
      ])
      setShowCreateForm(false)
    } catch (error) {
      setCreateError(getApiErrorMessage(error))
    } finally {
      setIsCreating(false)
    }
  }

  async function openEdit(id: number) {
    if (editingId === id) {
      setEditingId(null)
      return
    }
    setEditingId(id)
    setEditDefaults(null)
    setIsLoadingEdit(true)
    setEditError(null)
    try {
      const detail = await questionService.getQuestionByIdForAdmin(id)
      setEditDefaults(toEditFormValues(detail))
    } catch (error) {
      setEditError(getApiErrorMessage(error))
    } finally {
      setIsLoadingEdit(false)
    }
  }

  async function handleEdit(id: number, data: QuestionFormValues) {
    setIsSavingEdit(true)
    setEditError(null)
    try {
      const updated = await questionService.updateQuestion(id, toQuestionRequest(data))
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === updated.id
            ? { id: updated.id, sourceType: updated.sourceType, sourceId: updated.sourceId, type: updated.type, promptText: updated.promptText, difficulty: updated.difficulty }
            : q,
        ),
      )
      setEditingId(null)
    } catch (error) {
      setEditError(getApiErrorMessage(error))
    } finally {
      setIsSavingEdit(false)
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Xoá câu hỏi này? Hành động không thể hoàn tác.')) return
    setDeletingId(id)
    setDeleteError(null)
    try {
      await questionService.deleteQuestion(id)
      setQuestions((prev) => prev.filter((q) => q.id !== id))
    } catch (error) {
      setDeleteError(getApiErrorMessage(error))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>
        <h2 className="h5" style={{ margin: 0 }}>
          Câu hỏi ({questions.length})
        </h2>
        <Button
          size="sm"
          variant="outline"
          leftIcon={showCreateForm ? <X size={14} /> : <Plus size={14} />}
          onClick={() => setShowCreateForm((v) => !v)}
        >
          {showCreateForm ? 'Đóng' : 'Thêm câu hỏi'}
        </Button>
      </div>

      {deleteError && <p className={styles.errorText}>{deleteError}</p>}
      {loadError && <p className={styles.errorText}>{loadError}</p>}

      {showCreateForm && (
        <Card padding="md" className={styles.formCard}>
          <QuestionForm
            languages={languages}
            defaultValues={{ ...EMPTY_QUESTION_FORM, sourceType: 'LESSON', sourceId: String(lessonId) }}
            onSubmit={handleCreate}
            onCancel={() => setShowCreateForm(false)}
            isSubmitting={isCreating}
            submitLabel="Tạo câu hỏi"
            error={createError}
            lockSource
          />
        </Card>
      )}

      {isLoading ? (
        <Skeleton height={80} />
      ) : questions.length === 0 ? (
        <Card>
          <p className={styles.emptyText}>Bài học chưa có câu hỏi nào.</p>
        </Card>
      ) : (
        <div className={styles.questionList}>
          {questions.map((question) => (
            <Card key={question.id} padding="md" className={styles.questionItem}>
              <div className={styles.questionHeader}>
                <span className={styles.questionPrompt}>{question.promptText || '(không có nội dung text)'}</span>
                <div className={styles.questionActions}>
                  <Button size="sm" variant="outline" leftIcon={<Pencil size={12} />} onClick={() => openEdit(question.id)}>
                    Sửa
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Trash2 size={12} />}
                    isLoading={deletingId === question.id}
                    onClick={() => handleDelete(question.id)}
                  >
                    Xoá
                  </Button>
                </div>
              </div>
              <div className={styles.questionMeta}>
                <Badge variant="secondary">{QUESTION_TYPE_LABELS[question.type]}</Badge>
                {question.difficulty && <Badge variant="neutral">{question.difficulty}</Badge>}
              </div>

              {editingId === question.id && (
                <div className={styles.editFormWrapper}>
                  {isLoadingEdit || !editDefaults ? (
                    <Skeleton height={200} />
                  ) : (
                    <QuestionForm
                      languages={languages}
                      defaultValues={editDefaults}
                      onSubmit={(data) => handleEdit(question.id, data)}
                      onCancel={() => setEditingId(null)}
                      isSubmitting={isSavingEdit}
                      submitLabel="Lưu thay đổi"
                      error={editError}
                      lockSource
                    />
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default LessonQuestionManager
