import { useEffect, useState } from 'react'
import { AlertCircle, HelpCircle, Pencil, Plus, Trash2, X } from 'lucide-react'
import questionService from '../../services/questionService'
import languageService from '../../services/languageService'
import { getApiErrorMessage } from '../../api/apiError'
import { Badge, Button, Card, Pagination, Select, Skeleton } from '../../components/ui'
import QuestionForm, { type QuestionFormValues } from '../../components/admin/QuestionForm'
import { EMPTY_QUESTION_FORM, QUESTION_TYPE_LABELS, SOURCE_TYPE_LABELS, toQuestionRequest } from '../../components/admin/questionFormShared'
import type { QuestionResponse, QuestionSummaryResponse } from '../../types/question'
import type { LanguageResponse } from '../../types/language'
import type { QuestionSourceType } from '../../types/quiz'
import styles from './AdminQuestionListPage.module.scss'

const PAGE_SIZE = 20

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

function AdminQuestionListPage() {
  const [languages, setLanguages] = useState<LanguageResponse[]>([])

  const [filterSourceType, setFilterSourceType] = useState<QuestionSourceType | ''>('')
  const [filterSourceId, setFilterSourceId] = useState('')
  const [appliedFilter, setAppliedFilter] = useState<{ sourceType?: QuestionSourceType; sourceId?: number }>({})

  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [questions, setQuestions] = useState<QuestionSummaryResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editDefaults, setEditDefaults] = useState<QuestionFormValues | null>(null)
  const [isLoadingEdit, setIsLoadingEdit] = useState(false)
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    languageService.getActiveLanguages().then(setLanguages)
  }, [])

  useEffect(() => {
    let ignore = false

    async function load() {
      setIsLoading(true)
      setErrorMessage(null)
      try {
        const data = await questionService.getAllQuestionsForAdmin({ ...appliedFilter, page, size: PAGE_SIZE })
        if (ignore) return
        setQuestions(data.content)
        setTotalPages(data.totalPages)
      } catch (error) {
        if (!ignore) setErrorMessage(getApiErrorMessage(error))
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    load()
    return () => {
      ignore = true
    }
  }, [page, appliedFilter])

  function applyFilter() {
    setPage(0)
    setAppliedFilter(
      filterSourceType && filterSourceId ? { sourceType: filterSourceType, sourceId: Number(filterSourceId) } : {},
    )
  }

  function clearFilter() {
    setFilterSourceType('')
    setFilterSourceId('')
    setPage(0)
    setAppliedFilter({})
  }

  async function onCreateSubmit(data: QuestionFormValues) {
    setIsCreating(true)
    setCreateError(null)
    try {
      const created = await questionService.createQuestion(toQuestionRequest(data))
      setQuestions((prev) => [
        {
          id: created.id,
          sourceType: created.sourceType,
          sourceId: created.sourceId,
          type: created.type,
          promptText: created.promptText,
          difficulty: created.difficulty,
        },
        ...prev,
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

  async function onEditSubmit(id: number, data: QuestionFormValues) {
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
    setActionError(null)
    try {
      await questionService.deleteQuestion(id)
      setQuestions((prev) => prev.filter((q) => q.id !== id))
    } catch (error) {
      setActionError(getApiErrorMessage(error))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Ngân hàng câu hỏi</h1>
          <p className={styles.subtitle}>Quản lý câu hỏi dùng để generate Quiz động (theo Lesson/Course/Deck/Danh sách từ vựng)</p>
        </div>
        <Button onClick={() => setShowCreateForm((v) => !v)} leftIcon={showCreateForm ? <X size={16} /> : <Plus size={16} />}>
          {showCreateForm ? 'Đóng' : 'Tạo câu hỏi'}
        </Button>
      </div>

      {showCreateForm && (
        <Card padding="lg" className={styles.formCard}>
          <QuestionForm
            languages={languages}
            defaultValues={EMPTY_QUESTION_FORM}
            onSubmit={onCreateSubmit}
            onCancel={() => setShowCreateForm(false)}
            isSubmitting={isCreating}
            submitLabel="Tạo câu hỏi"
            error={createError}
          />
        </Card>
      )}

      <Card padding="md" className={styles.filterCard}>
        <div className={styles.filterRow}>
          <Select label="Lọc theo nguồn" value={filterSourceType} onChange={(e) => setFilterSourceType(e.target.value as QuestionSourceType | '')}>
            <option value="">Tất cả</option>
            {Object.entries(SOURCE_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <label className={styles.filterIdField}>
            <span className={styles.filterIdLabel}>ID nguồn</span>
            <input
              type="number"
              className={styles.filterIdInput}
              value={filterSourceId}
              onChange={(e) => setFilterSourceId(e.target.value)}
              disabled={!filterSourceType}
            />
          </label>
          <div className={styles.filterActions}>
            <Button size="sm" onClick={applyFilter} disabled={!filterSourceType || !filterSourceId}>
              Lọc
            </Button>
            <Button size="sm" variant="ghost" onClick={clearFilter}>
              Xoá lọc
            </Button>
          </div>
        </div>
      </Card>

      {actionError && <p className={styles.errorText}>{actionError}</p>}

      {errorMessage ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>
            <AlertCircle size={26} />
          </span>
          <p>{errorMessage}</p>
        </div>
      ) : isLoading ? (
        <>
          <Skeleton height={56} style={{ marginBottom: 12 }} />
          <Skeleton height={56} style={{ marginBottom: 12 }} />
          <Skeleton height={56} />
        </>
      ) : questions.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>
            <HelpCircle size={26} />
          </span>
          <p>Chưa có câu hỏi nào.</p>
        </div>
      ) : (
        <>
          <div className={styles.list}>
            {questions.map((question) => (
              <Card key={question.id} padding="md" className={styles.item}>
                <div className={styles.itemRow}>
                  <div className={styles.itemMain}>
                    <span className={styles.itemPrompt}>{question.promptText || '(không có nội dung text)'}</span>
                    <Badge variant="secondary">{QUESTION_TYPE_LABELS[question.type]}</Badge>
                    <Badge variant="neutral">
                      {SOURCE_TYPE_LABELS[question.sourceType]} #{question.sourceId}
                    </Badge>
                    {question.difficulty && <Badge variant="neutral">{question.difficulty}</Badge>}
                  </div>
                  <div className={styles.itemActions}>
                    <Button size="sm" variant="outline" leftIcon={<Pencil size={14} />} onClick={() => openEdit(question.id)}>
                      Sửa
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Trash2 size={14} />}
                      isLoading={deletingId === question.id}
                      onClick={() => handleDelete(question.id)}
                    >
                      Xoá
                    </Button>
                  </div>
                </div>

                {editingId === question.id && (
                  <div className={styles.editFormWrapper}>
                    {isLoadingEdit || !editDefaults ? (
                      <Skeleton height={200} />
                    ) : (
                      <QuestionForm
                        languages={languages}
                        defaultValues={editDefaults}
                        onSubmit={(data) => onEditSubmit(question.id, data)}
                        onCancel={() => setEditingId(null)}
                        isSubmitting={isSavingEdit}
                        submitLabel="Lưu thay đổi"
                        error={editError}
                      />
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}

export default AdminQuestionListPage
