import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import courseService from '../../services/courseService'
import languageService from '../../services/languageService'
import { getApiErrorMessage } from '../../api/apiError'
import type { CourseSummaryResponse } from '../../types/course'
import type { LanguageResponse } from '../../types/language'

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
    <div className="container py-5">
      <h1 className="h3 mb-4">Khoá học</h1>

      <form className="row g-2 mb-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="col-md-4">
          <input className="form-control" placeholder="Tìm theo tên khoá học..." {...register('keyword')} />
        </div>
        <div className="col-md-3">
          <select className="form-select" {...register('languageId')}>
            <option value="">Tất cả ngôn ngữ</option>
            {languages.map((language) => (
              <option key={language.id} value={language.id}>
                {language.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <input className="form-control" placeholder="Trình độ (vd A1, B2...)" {...register('level')} />
        </div>
        <div className="col-md-2">
          <button type="submit" className="btn btn-primary w-100">
            Tìm kiếm
          </button>
        </div>
      </form>

      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      {isLoading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border" role="status" />
        </div>
      ) : courses.length === 0 ? (
        <p className="text-muted">Không tìm thấy khoá học nào.</p>
      ) : (
        <>
          <div className="row g-4">
            {courses.map((course) => (
              <div className="col-md-4" key={course.id}>
                <Link to={`/courses/${course.id}`} className="text-decoration-none text-body">
                  <div className="card h-100">
                    {course.thumbnailUrl && (
                      <img src={course.thumbnailUrl} className="card-img-top" alt={course.title} />
                    )}
                    <div className="card-body">
                      <h2 className="h5 card-title">{course.title}</h2>
                      <p className="card-text text-muted mb-1">{course.languageCode.toUpperCase()}</p>
                      {course.difficulty && <span className="badge bg-secondary me-1">{course.difficulty}</span>}
                      {course.estimatedMinutes != null && (
                        <span className="badge bg-light text-dark">{course.estimatedMinutes} phút</span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="mt-4">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                  <button type="button" className="page-link" onClick={() => setPage((p) => p - 1)}>
                    Trước
                  </button>
                </li>
                <li className="page-item disabled">
                  <span className="page-link">
                    Trang {page + 1}/{totalPages}
                  </span>
                </li>
                <li className={`page-item ${page + 1 >= totalPages ? 'disabled' : ''}`}>
                  <button type="button" className="page-link" onClick={() => setPage((p) => p + 1)}>
                    Sau
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  )
}

export default CourseListPage
