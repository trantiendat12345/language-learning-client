import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { AlertCircle, Search, SearchX, SlidersHorizontal } from 'lucide-react'
import courseService from '../../services/courseService'
import languageService from '../../services/languageService'
import { getApiErrorMessage } from '../../api/apiError'
import { Button, Input, Pagination, Select } from '../../components/ui'
import CourseCard from '../../components/courses/CourseCard'
import CourseCardSkeleton from '../../components/courses/CourseCardSkeleton'
import type { CourseSummaryResponse } from '../../types/course'
import type { LanguageResponse } from '../../types/language'
import styles from './CourseListPage.module.scss'

interface CourseFilterForm {
  keyword: string
  languageId: string
  level: string
}

const PAGE_SIZE = 12
const EMPTY_FILTERS: CourseFilterForm = { keyword: '', languageId: '', level: '' }

function CourseListPage() {
  const [languages, setLanguages] = useState<LanguageResponse[]>([])
  const [courses, setCourses] = useState<CourseSummaryResponse[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [filters, setFilters] = useState<CourseFilterForm>(EMPTY_FILTERS)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { register, handleSubmit } = useForm<CourseFilterForm>({ defaultValues: EMPTY_FILTERS })

  useEffect(() => {
    languageService.getActiveLanguages().then(setLanguages)
  }, [])

  useEffect(() => {
    let ignore = false

    async function loadCourses() {
      setIsLoading(true)
      setErrorMessage(null)
      try {
        const data = await courseService.getCourses({
          keyword: filters.keyword || undefined,
          languageId: filters.languageId ? Number(filters.languageId) : undefined,
          level: filters.level || undefined,
          page,
          size: PAGE_SIZE,
        })
        if (ignore) return
        setCourses(data.content)
        setTotalPages(data.totalPages)
      } catch (error) {
        if (!ignore) setErrorMessage(getApiErrorMessage(error))
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadCourses()
    return () => {
      ignore = true
    }
  }, [filters, page])

  function onSubmit(data: CourseFilterForm) {
    setPage(0)
    setFilters(data)
  }

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.header}>
        <h1>Khoá học</h1>
        <p className={styles.subtitle}>Khám phá thư viện khoá học và bắt đầu hành trình học tiếng Anh của bạn</p>
      </div>

      <form className={styles.filters} onSubmit={handleSubmit(onSubmit)}>
        <Input placeholder="Tìm theo tên khoá học..." leftIcon={<Search size={17} />} {...register('keyword')} />
        <Select {...register('languageId')}>
          <option value="">Tất cả ngôn ngữ</option>
          {languages.map((language) => (
            <option key={language.id} value={language.id}>
              {language.name}
            </option>
          ))}
        </Select>
        <Input placeholder="Trình độ (vd A1, B2...)" {...register('level')} />
        <Button type="submit" className={styles.filterButton} leftIcon={<SlidersHorizontal size={16} />}>
          Lọc
        </Button>
      </form>

      {errorMessage && (
        <div className={`${styles.empty}`} role="alert">
          <span className={styles.emptyIcon}>
            <AlertCircle size={26} />
          </span>
          <p>{errorMessage}</p>
        </div>
      )}

      {!errorMessage && (
        <>
          {isLoading ? (
            <div className={styles.grid}>
              {Array.from({ length: 6 }).map((_, index) => (
                <CourseCardSkeleton key={index} />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>
                <SearchX size={26} />
              </span>
              <p>Không tìm thấy khoá học nào phù hợp với bộ lọc hiện tại.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {courses.map((course) => (
                <CourseCard course={course} key={course.id} />
              ))}
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}

export default CourseListPage
