import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Clock, Plus, Trash2, X } from 'lucide-react'
import courseService from '../../services/courseService'
import { getApiErrorMessage } from '../../api/apiError'
import { Badge, Button, Card, Input, Select, Skeleton } from '../../components/ui'
import type { BadgeVariant } from '../../components/ui'
import type { CourseResponse, CourseStatus } from '../../types/course'
import type { LessonStatus } from '../../types/lesson'
import styles from './AdminCourseDetailPage.module.scss'

const STATUS_LABEL: Record<LessonStatus, { label: string; variant: BadgeVariant }> = {
  DRAFT: { label: 'Nháp', variant: 'neutral' },
  PUBLISHED: { label: 'Đã xuất bản', variant: 'success' },
  ARCHIVED: { label: 'Đã lưu trữ', variant: 'danger' },
}

interface EditForm {
  title: string
  description: string
  thumbnailUrl: string
  difficulty: string
  estimatedMinutes: string
  displayOrder: string
  status: CourseStatus
}

interface CreateLessonForm {
  title: string
  description: string
  displayOrder: string
  videoUrl: string
  audioUrl: string
  estimatedMinutes: string
}

const EMPTY_CREATE_LESSON: CreateLessonForm = {
  title: '',
  description: '',
  displayOrder: '0',
  videoUrl: '',
  audioUrl: '',
  estimatedMinutes: '',
}

function AdminCourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [course, setCourse] = useState<CourseResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const { register, handleSubmit, reset } = useForm<EditForm>()

  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const [showCreateLesson, setShowCreateLesson] = useState(false)
  const [isCreatingLesson, setIsCreatingLesson] = useState(false)
  const [createLessonError, setCreateLessonError] = useState<string | null>(null)
  const {
    register: registerLesson,
    handleSubmit: handleLessonSubmit,
    reset: resetLessonForm,
  } = useForm<CreateLessonForm>({ defaultValues: EMPTY_CREATE_LESSON })

  useEffect(() => {
    if (!id) return
    let ignore = false

    async function load() {
      setIsLoading(true)
      setErrorMessage(null)
      try {
        const data = await courseService.getCourseByIdForAdmin(Number(id))
        if (ignore) return
        setCourse(data)
        reset({
          title: data.title,
          description: data.description ?? '',
          thumbnailUrl: data.thumbnailUrl ?? '',
          difficulty: data.difficulty ?? '',
          estimatedMinutes: data.estimatedMinutes != null ? String(data.estimatedMinutes) : '',
          displayOrder: String(data.displayOrder),
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
    if (!course) return
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      const updated = await courseService.updateCourse(course.id, {
        title: data.title,
        description: data.description || undefined,
        thumbnailUrl: data.thumbnailUrl || undefined,
        difficulty: data.difficulty || undefined,
        estimatedMinutes: data.estimatedMinutes ? Number(data.estimatedMinutes) : undefined,
        displayOrder: Number(data.displayOrder) || 0,
        status: data.status,
      })
      setCourse((prev) => (prev ? { ...prev, ...updated } : updated))
      setSaveSuccess(true)
    } catch (error) {
      setSaveError(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!course) return
    if (!window.confirm('Xoá Khoá học này? Toàn bộ Bài học bên trong vẫn còn nhưng sẽ không truy cập được qua Khoá học này nữa.')) return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await courseService.deleteCourse(course.id)
      navigate('/admin/courses')
    } catch (error) {
      setDeleteError(getApiErrorMessage(error))
      setIsDeleting(false)
    }
  }

  async function onCreateLessonSubmit(data: CreateLessonForm) {
    if (!course) return
    setIsCreatingLesson(true)
    setCreateLessonError(null)
    try {
      const created = await courseService.createLesson(course.id, {
        title: data.title,
        description: data.description || undefined,
        displayOrder: Number(data.displayOrder) || 0,
        videoUrl: data.videoUrl || undefined,
        audioUrl: data.audioUrl || undefined,
        estimatedMinutes: data.estimatedMinutes ? Number(data.estimatedMinutes) : undefined,
      })
      setCourse((prev) =>
        prev
          ? {
              ...prev,
              lessons: [
                ...prev.lessons,
                { id: created.id, title: created.title, displayOrder: created.displayOrder, estimatedMinutes: created.estimatedMinutes, status: created.status },
              ],
            }
          : prev,
      )
      resetLessonForm(EMPTY_CREATE_LESSON)
      setShowCreateLesson(false)
    } catch (error) {
      setCreateLessonError(getApiErrorMessage(error))
    } finally {
      setIsCreatingLesson(false)
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

  if (errorMessage || !course) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <span className={styles.errorIcon}>
            <AlertCircle size={26} />
          </span>
          <p>{errorMessage ?? 'Không tìm thấy Khoá học'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Link to="/admin/courses" className={styles.backLink}>
        <ArrowLeft size={16} />
        Quay lại danh sách Khoá học
      </Link>

      <h1>{course.title}</h1>
      <p className={styles.subtitle}>{course.languageName}</p>

      <Card padding="lg" className={styles.sectionCard}>
        <h2 className="h5">Thông tin Khoá học</h2>
        {saveSuccess && <p className={styles.successText}>Đã lưu thay đổi</p>}
        {saveError && <p className={styles.errorText}>{saveError}</p>}
        <form className={styles.form} onSubmit={handleSubmit(onSaveSubmit)}>
          <Input label="Tên khoá học" {...register('title', { required: true })} />
          <Input label="Trình độ" {...register('difficulty')} />
          <Input label="Thời lượng ước tính (phút)" type="number" {...register('estimatedMinutes')} />
          <Input label="Thứ tự hiển thị" type="number" {...register('displayOrder')} />
          <Select label="Trạng thái" {...register('status', { required: true })}>
            <option value="DRAFT">Nháp</option>
            <option value="PUBLISHED">Đã xuất bản</option>
            <option value="ARCHIVED">Đã lưu trữ</option>
          </Select>
          <Input label="URL ảnh bìa" {...register('thumbnailUrl')} />
          <Input label="Mô tả" {...register('description')} />
          <div className={styles.formActions}>
            <Button type="submit" isLoading={isSaving}>
              Lưu thay đổi
            </Button>
            <Button type="button" variant="danger" isLoading={isDeleting} leftIcon={<Trash2 size={14} />} onClick={handleDelete}>
              Xoá Khoá học
            </Button>
          </div>
          {deleteError && <p className={styles.errorText}>{deleteError}</p>}
        </form>
      </Card>

      <div className={styles.lessonsSection}>
        <div className={styles.sectionTitle}>
          <h2 className="h5" style={{ margin: 0 }}>
            Bài học ({course.lessons.length})
          </h2>
          <Button
            size="sm"
            variant="outline"
            leftIcon={showCreateLesson ? <X size={14} /> : <Plus size={14} />}
            onClick={() => setShowCreateLesson((v) => !v)}
          >
            {showCreateLesson ? 'Đóng' : 'Thêm bài học'}
          </Button>
        </div>

        {showCreateLesson && (
          <form className={styles.form} onSubmit={handleLessonSubmit(onCreateLessonSubmit)}>
            <Input label="Tên bài học" {...registerLesson('title', { required: true })} />
            <Input label="Thứ tự hiển thị" type="number" {...registerLesson('displayOrder')} />
            <Input label="Thời lượng ước tính (phút)" type="number" {...registerLesson('estimatedMinutes')} />
            <Input label="URL video (tuỳ chọn)" {...registerLesson('videoUrl')} />
            <Input label="URL audio (tuỳ chọn)" {...registerLesson('audioUrl')} />
            <Input label="Mô tả (tuỳ chọn)" {...registerLesson('description')} />
            <Button type="submit" isLoading={isCreatingLesson} className={styles.formSubmit}>
              Thêm bài học
            </Button>
            {createLessonError && <p className={styles.errorText}>{createLessonError}</p>}
          </form>
        )}

        {course.lessons.length === 0 ? (
          <Card>
            <p className={styles.emptyLessons}>Khoá học chưa có Bài học nào.</p>
          </Card>
        ) : (
          <div className={styles.lessonList}>
            {[...course.lessons]
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((lesson) => {
                const status = STATUS_LABEL[lesson.status]
                return (
                  <Card
                    key={lesson.id}
                    padding="md"
                    hoverable
                    className={styles.lessonItem}
                    onClick={() => navigate(`/admin/lessons/${lesson.id}`)}
                  >
                    <span className={styles.lessonTitle}>{lesson.title}</span>
                    {lesson.estimatedMinutes != null && (
                      <span className={styles.lessonMeta}>
                        <Clock size={12} /> {lesson.estimatedMinutes} phút
                      </span>
                    )}
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </Card>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminCourseDetailPage
