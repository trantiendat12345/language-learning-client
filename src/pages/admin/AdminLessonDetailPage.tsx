import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Trash2 } from 'lucide-react'
import lessonService from '../../services/lessonService'
import { getApiErrorMessage } from '../../api/apiError'
import { Button, Card, Input, Select, Skeleton } from '../../components/ui'
import LessonVocabularyManager from '../../components/admin/LessonVocabularyManager'
import LessonGrammarManager from '../../components/admin/LessonGrammarManager'
import LessonQuestionManager from '../../components/admin/LessonQuestionManager'
import type { LessonResponse, LessonStatus, LessonVocabularyResponse } from '../../types/lesson'
import type { GrammarResponse } from '../../types/grammar'
import styles from './AdminLessonDetailPage.module.scss'

interface EditForm {
  title: string
  description: string
  displayOrder: string
  videoUrl: string
  audioUrl: string
  estimatedMinutes: string
  status: LessonStatus
}

function AdminLessonDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [lesson, setLesson] = useState<LessonResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const { register, handleSubmit, reset } = useForm<EditForm>()

  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let ignore = false

    async function load() {
      setIsLoading(true)
      setErrorMessage(null)
      try {
        const data = await lessonService.getLessonByIdForAdmin(Number(id))
        if (ignore) return
        setLesson(data)
        reset({
          title: data.title,
          description: data.description ?? '',
          displayOrder: String(data.displayOrder),
          videoUrl: data.videoUrl ?? '',
          audioUrl: data.audioUrl ?? '',
          estimatedMinutes: data.estimatedMinutes != null ? String(data.estimatedMinutes) : '',
          status: data.status,
        })
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
  }, [id, reset])

  async function onSaveSubmit(data: EditForm) {
    if (!lesson) return
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      const updated = await lessonService.updateLesson(lesson.id, {
        title: data.title,
        description: data.description || undefined,
        displayOrder: Number(data.displayOrder) || 0,
        videoUrl: data.videoUrl || undefined,
        audioUrl: data.audioUrl || undefined,
        estimatedMinutes: data.estimatedMinutes ? Number(data.estimatedMinutes) : undefined,
        status: data.status,
      })
      setLesson((prev) => (prev ? { ...prev, ...updated } : updated))
      setSaveSuccess(true)
    } catch (error) {
      setSaveError(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!lesson) return
    if (!window.confirm('Xoá Bài học này? Hành động không thể hoàn tác.')) return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await lessonService.deleteLesson(lesson.id)
      navigate(`/admin/courses/${lesson.courseId}`)
    } catch (error) {
      setDeleteError(getApiErrorMessage(error))
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className={styles.page}>
        <Skeleton height={16} width={120} style={{ marginBottom: 24 }} />
        <Skeleton height={300} />
      </div>
    )
  }

  if (errorMessage || !lesson) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <span className={styles.errorIcon}>
            <AlertCircle size={26} />
          </span>
          <p>{errorMessage ?? 'Không tìm thấy Bài học'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Link to={`/admin/courses/${lesson.courseId}`} className={styles.backLink}>
        <ArrowLeft size={16} />
        Quay lại Khoá học
      </Link>

      <h1>{lesson.title}</h1>

      <Card padding="lg" className={styles.sectionCard}>
        <h2 className="h5">Thông tin Bài học</h2>
        {saveSuccess && <p className={styles.successText}>Đã lưu thay đổi</p>}
        {saveError && <p className={styles.errorText}>{saveError}</p>}
        <form className={styles.form} onSubmit={handleSubmit(onSaveSubmit)}>
          <Input label="Tên bài học" {...register('title', { required: true })} />
          <Input label="Thứ tự hiển thị" type="number" {...register('displayOrder')} />
          <Input label="Thời lượng ước tính (phút)" type="number" {...register('estimatedMinutes')} />
          <Select label="Trạng thái" {...register('status', { required: true })}>
            <option value="DRAFT">Nháp</option>
            <option value="PUBLISHED">Đã xuất bản</option>
            <option value="ARCHIVED">Đã lưu trữ</option>
          </Select>
          <Input label="URL video" {...register('videoUrl')} />
          <Input label="URL audio" {...register('audioUrl')} />
          <Input label="Mô tả" {...register('description')} />
          <div className={styles.formActions}>
            <Button type="submit" isLoading={isSaving}>
              Lưu thay đổi
            </Button>
            <Button type="button" variant="danger" isLoading={isDeleting} leftIcon={<Trash2 size={14} />} onClick={handleDelete}>
              Xoá Bài học
            </Button>
          </div>
          {deleteError && <p className={styles.errorText}>{deleteError}</p>}
        </form>
      </Card>

      <LessonVocabularyManager
        lessonId={lesson.id}
        vocabularies={lesson.vocabularies}
        onChange={(vocabularies: LessonVocabularyResponse[]) => setLesson((prev) => (prev ? { ...prev, vocabularies } : prev))}
      />

      <LessonGrammarManager
        lessonId={lesson.id}
        grammars={lesson.grammars}
        onChange={(grammars: GrammarResponse[]) => setLesson((prev) => (prev ? { ...prev, grammars } : prev))}
      />

      <LessonQuestionManager lessonId={lesson.id} />
    </div>
  )
}

export default AdminLessonDetailPage
