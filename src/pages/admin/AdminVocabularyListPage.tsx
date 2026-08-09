import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { AlertCircle, BookOpen, Pencil, Plus, Trash2, X } from 'lucide-react'
import vocabularyService from '../../services/vocabularyService'
import languageService from '../../services/languageService'
import { getApiErrorMessage } from '../../api/apiError'
import { Badge, Button, Card, Input, Pagination, Select, Skeleton } from '../../components/ui'
import SpreadsheetImportPanel from '../../components/common/SpreadsheetImportPanel'
import type { VocabularyResponse, VocabularyStatus, VocabularySummaryResponse } from '../../types/vocabulary'
import type { LanguageResponse } from '../../types/language'
import styles from './AdminVocabularyListPage.module.scss'

const PAGE_SIZE = 20

interface VocabForm {
  languageId: string
  word: string
  meaning: string
  ipa: string
  pronunciationAudioUrl: string
  wordType: string
  imageUrl: string
  difficulty: string
  exampleSentence: string
  exampleTranslation: string
  frequencyRank: string
  status: VocabularyStatus
}

const EMPTY_FORM: VocabForm = {
  languageId: '',
  word: '',
  meaning: '',
  ipa: '',
  pronunciationAudioUrl: '',
  wordType: '',
  imageUrl: '',
  difficulty: '',
  exampleSentence: '',
  exampleTranslation: '',
  frequencyRank: '',
  status: 'ACTIVE',
}

function toCreateRequest(data: VocabForm) {
  return {
    languageId: Number(data.languageId),
    word: data.word,
    meaning: data.meaning,
    ipa: data.ipa || undefined,
    pronunciationAudioUrl: data.pronunciationAudioUrl || undefined,
    wordType: data.wordType || undefined,
    imageUrl: data.imageUrl || undefined,
    difficulty: data.difficulty || undefined,
    exampleSentence: data.exampleSentence || undefined,
    exampleTranslation: data.exampleTranslation || undefined,
    frequencyRank: data.frequencyRank ? Number(data.frequencyRank) : undefined,
  }
}

function AdminVocabularyListPage() {
  const [languages, setLanguages] = useState<LanguageResponse[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [words, setWords] = useState<VocabularySummaryResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const { register: registerCreate, handleSubmit: handleCreateSubmit, reset: resetCreateForm } = useForm<VocabForm>({
    defaultValues: EMPTY_FORM,
  })

  const [editingId, setEditingId] = useState<number | null>(null)
  const [isLoadingEdit, setIsLoadingEdit] = useState(false)
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const { register: registerEdit, handleSubmit: handleEditSubmit, reset: resetEditForm } = useForm<VocabForm>()

  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const [importLanguageId, setImportLanguageId] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    languageService.getActiveLanguages().then(setLanguages)
  }, [])

  useEffect(() => {
    let ignore = false

    async function load() {
      setIsLoading(true)
      setErrorMessage(null)
      try {
        const data = await vocabularyService.getAllVocabulariesForAdmin({ page, size: PAGE_SIZE })
        if (ignore) return
        setWords(data.content)
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
  }, [page, refreshKey])

  function handleImportSuccess() {
    setPage(0)
    setRefreshKey((k) => k + 1)
  }

  async function onCreateSubmit(data: VocabForm) {
    setIsCreating(true)
    setCreateError(null)
    try {
      const created = await vocabularyService.createVocabulary(toCreateRequest(data))
      setWords((prev) => [
        {
          id: created.id,
          languageCode: created.languageCode,
          word: created.word,
          meaning: created.meaning,
          ipa: created.ipa,
          imageUrl: created.imageUrl,
          wordType: created.wordType,
          status: created.status,
        },
        ...prev,
      ])
      resetCreateForm(EMPTY_FORM)
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
    setIsLoadingEdit(true)
    setEditError(null)
    try {
      const detail = await vocabularyService.getVocabularyByIdForAdmin(id)
      resetEditForm({
        languageId: String(detail.languageId),
        word: detail.word,
        meaning: detail.meaning,
        ipa: detail.ipa ?? '',
        pronunciationAudioUrl: detail.pronunciationAudioUrl ?? '',
        wordType: detail.wordType ?? '',
        imageUrl: detail.imageUrl ?? '',
        difficulty: detail.difficulty ?? '',
        exampleSentence: detail.exampleSentence ?? '',
        exampleTranslation: detail.exampleTranslation ?? '',
        frequencyRank: detail.frequencyRank != null ? String(detail.frequencyRank) : '',
        status: detail.status,
      })
    } catch (error) {
      setEditError(getApiErrorMessage(error))
    } finally {
      setIsLoadingEdit(false)
    }
  }

  async function onEditSubmit(data: VocabForm) {
    if (editingId == null) return
    setIsSavingEdit(true)
    setEditError(null)
    try {
      const updated: VocabularyResponse = await vocabularyService.updateVocabulary(editingId, { ...toCreateRequest(data), status: data.status })
      setWords((prev) =>
        prev.map((w) =>
          w.id === updated.id
            ? {
                id: updated.id,
                languageCode: updated.languageCode,
                word: updated.word,
                meaning: updated.meaning,
                ipa: updated.ipa,
                imageUrl: updated.imageUrl,
                wordType: updated.wordType,
                status: updated.status,
              }
            : w,
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
    if (!window.confirm('Xoá từ vựng này? Từ vẫn có thể đang được gắn vào Lesson/Deck.')) return
    setDeletingId(id)
    setActionError(null)
    try {
      await vocabularyService.deleteVocabulary(id)
      setWords((prev) => prev.filter((w) => w.id !== id))
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
          <h1>Từ vựng</h1>
          <p className={styles.subtitle}>Quản lý kho từ vựng hệ thống</p>
        </div>
        <div className={styles.headerActions}>
          <Button onClick={() => setShowCreateForm((v) => !v)} leftIcon={showCreateForm ? <X size={16} /> : <Plus size={16} />}>
            {showCreateForm ? 'Đóng' : 'Tạo từ mới'}
          </Button>
          <div className={styles.importGroup}>
            <Select
              className={styles.importLanguageSelect}
              value={importLanguageId}
              onChange={(e) => setImportLanguageId(e.target.value)}
            >
              <option value="">Chọn ngôn ngữ để Import</option>
              {languages.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </Select>
            <SpreadsheetImportPanel
              disabled={!importLanguageId}
              disabledHint="Chọn Ngôn ngữ ở trên trước khi Import"
              onImportCsv={(file) => vocabularyService.importVocabulariesCsv(Number(importLanguageId), file)}
              onImportExcel={(file) => vocabularyService.importVocabulariesExcel(Number(importLanguageId), file)}
              onDownloadCsvTemplate={vocabularyService.downloadVocabularyCsvTemplate}
              onDownloadExcelTemplate={vocabularyService.downloadVocabularyExcelTemplate}
              onImportSuccess={handleImportSuccess}
            />
          </div>
        </div>
      </div>

      {showCreateForm && (
        <form className={styles.form} onSubmit={handleCreateSubmit(onCreateSubmit)}>
          <Select label="Ngôn ngữ" {...registerCreate('languageId', { required: true })}>
            <option value="">Chọn ngôn ngữ</option>
            {languages.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </Select>
          <Input label="Từ" {...registerCreate('word', { required: true })} />
          <Input label="Nghĩa" {...registerCreate('meaning', { required: true })} />
          <Input label="Phiên âm (IPA)" {...registerCreate('ipa')} />
          <Input label="Loại từ (vd noun, verb...)" {...registerCreate('wordType')} />
          <Input label="Độ khó" {...registerCreate('difficulty')} />
          <Input label="URL ảnh" {...registerCreate('imageUrl')} />
          <Input label="URL audio phát âm" {...registerCreate('pronunciationAudioUrl')} />
          <Input label="Thứ hạng tần suất (tuỳ chọn)" type="number" {...registerCreate('frequencyRank')} />
          <Input label="Câu ví dụ" {...registerCreate('exampleSentence')} />
          <Input label="Dịch câu ví dụ" {...registerCreate('exampleTranslation')} />
          <Button type="submit" isLoading={isCreating} className={styles.formSubmit}>
            Tạo từ
          </Button>
          {createError && <p className={styles.errorText}>{createError}</p>}
        </form>
      )}

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
      ) : words.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>
            <BookOpen size={26} />
          </span>
          <p>Chưa có từ vựng nào.</p>
        </div>
      ) : (
        <>
          <div className={styles.list}>
            {words.map((word) => (
              <Card key={word.id} padding="md" className={styles.item}>
                <div className={styles.itemRow}>
                  <div className={styles.itemMain}>
                    <span className={styles.itemWord}>{word.word}</span>
                    {word.ipa && <span className={styles.itemIpa}>/{word.ipa}/</span>}
                    <span className={styles.itemMeaning}>{word.meaning}</span>
                    <Badge variant="secondary">{word.languageCode.toUpperCase()}</Badge>
                    <Badge variant={word.status === 'ACTIVE' ? 'success' : 'neutral'}>
                      {word.status === 'ACTIVE' ? 'Hoạt động' : 'Đã lưu trữ'}
                    </Badge>
                  </div>
                  <div className={styles.itemActions}>
                    <Button size="sm" variant="outline" leftIcon={<Pencil size={14} />} onClick={() => openEdit(word.id)}>
                      Sửa
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Trash2 size={14} />}
                      isLoading={deletingId === word.id}
                      onClick={() => handleDelete(word.id)}
                    >
                      Xoá
                    </Button>
                  </div>
                </div>

                {editingId === word.id && (
                  <>
                    {isLoadingEdit ? (
                      <Skeleton height={100} style={{ marginTop: 16 }} />
                    ) : (
                      <form className={styles.editForm} onSubmit={handleEditSubmit(onEditSubmit)}>
                        <Select label="Ngôn ngữ" {...registerEdit('languageId', { required: true })}>
                          {languages.map((l) => (
                            <option key={l.id} value={l.id}>
                              {l.name}
                            </option>
                          ))}
                        </Select>
                        <Input label="Từ" {...registerEdit('word', { required: true })} />
                        <Input label="Nghĩa" {...registerEdit('meaning', { required: true })} />
                        <Input label="Phiên âm (IPA)" {...registerEdit('ipa')} />
                        <Input label="Loại từ" {...registerEdit('wordType')} />
                        <Input label="Độ khó" {...registerEdit('difficulty')} />
                        <Input label="URL ảnh" {...registerEdit('imageUrl')} />
                        <Input label="URL audio phát âm" {...registerEdit('pronunciationAudioUrl')} />
                        <Input label="Thứ hạng tần suất" type="number" {...registerEdit('frequencyRank')} />
                        <Input label="Câu ví dụ" {...registerEdit('exampleSentence')} />
                        <Input label="Dịch câu ví dụ" {...registerEdit('exampleTranslation')} />
                        <Select label="Trạng thái" {...registerEdit('status')}>
                          <option value="ACTIVE">Hoạt động</option>
                          <option value="ARCHIVED">Đã lưu trữ</option>
                        </Select>
                        <div className={styles.editFormActions}>
                          <Button type="submit" size="sm" isLoading={isSavingEdit}>
                            Lưu
                          </Button>
                          <Button type="button" size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                            Huỷ
                          </Button>
                        </div>
                        {editError && <p className={styles.errorText}>{editError}</p>}
                      </form>
                    )}
                  </>
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

export default AdminVocabularyListPage
