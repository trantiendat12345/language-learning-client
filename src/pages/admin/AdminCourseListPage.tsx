import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, BookOpen, Plus, X } from 'lucide-react'
import courseService from '../../services/courseService'
import languageService from '../../services/languageService'
import { getApiErrorMessage } from '../../api/apiError'
import { Badge, Button, Card, Input, Pagination, Select, Skeleton } from '../../components/ui'
import type { BadgeVariant } from '../../components/ui'
import type { CourseStatus, CourseSummaryResponse } from '../../types/course'
import type { LanguageResponse } from '../../types/language'
import styles from './AdminCourseListPage.module.scss'

const PAGE_SIZE = 20

const STATUS_LABEL: Record<CourseStatus, { label: string; variant: BadgeVariant }> = {
  DRAFT: { label: 'Nháp', variant: 'neutral' },
  PUBLISHED: { label: 'Đã xuất bản', variant: 'success' },
  ARCHIVED: { label: 'Đã lưu trữ', variant: 'danger' },
}

interface CreateForm {
  languageId: string
  title: string
  slug: string
  description: string
  thumbnailUrl: string
  difficulty: string
  estimatedMinutes: string
  displayOrder: string
}

const EMPTY_CREATE: CreateForm = {
  languageId: '',
  title: '',
  slug: '',
  description: '',
  thumbnailUrl: '',
  difficulty: '',
  estimatedMinutes: '',
  displayOrder: '0',
}

function AdminCourseListPage() {
  const navigate = useNavigate()

  const [languages, setLanguages] = useState<LanguageResponse[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [courses, setCourses] = useState<CourseSummaryResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const { register, handleSubmit, reset } = useForm<CreateForm>({ defaultValues: EMPTY_CREATE })

  useEffect(() => {
    languageService.getActiveLanguages().then(setLanguages)
  }, [])

  useEffect(() => {
    let ignore = false

    async function load() {
      setIsLoading(true)
      setErrorMessage(null)
      try {
        const data = await courseService.getAllCoursesForAdmin({ page, size: PAGE_SIZE })
        if (ignore) return
        setCourses(data.content)
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
  }, [page])

  async function onCreateSubmit(data: CreateForm) {
    setIsCreating(true)
    setCreateError(null)
    try {
      const created = await courseService.createCourse({
        languageId: Number(data.languageId),
        title: data.title,
        slug: data.slug,
        description: data.description || undefined,
        thumbnailUrl: data.thumbnailUrl || undefined,
        difficulty: data.difficulty || undefined,
        estimatedMinutes: data.estimatedMinutes ? Number(data.estimatedMinutes) : undefined,
        displayOrder: Number(data.displayOrder) || 0,
      })
      reset(EMPTY_CREATE)
      setShowCreateForm(false)
      navigate(`/admin/courses/${created.id}`)
    } catch (error) {
      setCreateError(getApiErrorMessage(error))
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Khoá học</h1>
          <p className={styles.subtitle}>Quản lý toàn bộ khoá học trong hệ thống (kể cả bản Nháp)</p>
        </div>
        <Button onClick={() => setShowCreateForm((v) => !v)} leftIcon={showCreateForm ? <X size={16} /> : <Plus size={16} />}>
          {showCreateForm ? 'Đóng' : 'Tạo Khoá học mới'}
        </Button>
      </div>

      {showCreateForm && (
        <form className={styles.form} onSubmit={handleSubmit(onCreateSubmit)}>
          <Input label="Tên khoá học" {...register('title', { required: true })} />
          <Input label="Slug (vd: tieng-anh-co-ban)" {...register('slug', { required: true })} />
          <Select label="Ngôn ngữ" {...register('languageId', { required: true })}>
            <option value="">Chọn ngôn ngữ</option>
            {languages.map((language) => (
              <option key={language.id} value={language.id}>
                {language.name}
              </option>
            ))}
          </Select>
          <Input label="Trình độ (vd A1, B2...)" {...register('difficulty')} />
          <Input label="Thời lượng ước tính (phút)" type="number" {...register('estimatedMinutes')} />
          <Input label="Thứ tự hiển thị" type="number" {...register('displayOrder')} />
          <Input label="URL ảnh bìa (tuỳ chọn)" {...register('thumbnailUrl')} />
          <Input label="Mô tả (tuỳ chọn)" {...register('description')} />
          <Button type="submit" isLoading={isCreating} className={styles.formSubmit}>
            Tạo Khoá học
          </Button>
          {createError && <p className={styles.errorText}>{createError}</p>}
        </form>
      )}

      {errorMessage ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>
            <AlertCircle size={26} />
          </span>
          <p>{errorMessage}</p>
        </div>
      ) : isLoading ? (
        <>
          <Skeleton height={64} style={{ marginBottom: 12 }} />
          <Skeleton height={64} style={{ marginBottom: 12 }} />
          <Skeleton height={64} />
        </>
      ) : courses.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>
            <BookOpen size={26} />
          </span>
          <p>Chưa có Khoá học nào.</p>
        </div>
      ) : (
        <>
          <div className={styles.list}>
            {courses.map((course) => {
              const status = STATUS_LABEL[course.status]
              return (
                <Card
                  key={course.id}
                  padding="md"
                  hoverable
                  className={styles.item}
                  onClick={() => navigate(`/admin/courses/${course.id}`)}
                >
                  <div className={styles.itemMain}>
                    <span className={styles.itemTitle}>{course.title}</span>
                    <span className={styles.itemMeta}>
                      {course.languageCode.toUpperCase()} · {course.difficulty ?? '—'} ·{' '}
                      {course.estimatedMinutes != null ? `${course.estimatedMinutes} phút` : '—'}
                    </span>
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </Card>
              )
            })}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}

export default AdminCourseListPage
