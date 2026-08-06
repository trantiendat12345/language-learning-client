import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import courseService from '../../services/courseService'
import { getApiErrorMessage } from '../../api/apiError'
import { useAuthContext } from '../../contexts/AuthContext'
import type { CourseResponse } from '../../types/course'

function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const [course, setCourse] = useState<CourseResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [enrollMessage, setEnrollMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let ignore = false

    async function loadCourse() {
      setIsLoading(true)
      setErrorMessage(null)
      try {
        const data = await courseService.getCourseById(Number(id))
        if (!ignore) setCourse(data)
      } catch (error) {
        if (!ignore) setErrorMessage(getApiErrorMessage(error))
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadCourse()
    return () => {
      ignore = true
    }
  }, [id])

  async function handleEnroll() {
    if (!id) return
    setIsEnrolling(true)
    setEnrollMessage(null)
    try {
      await courseService.enrollInCourse(Number(id))
      setEnrollMessage('Ghi danh thành công! Bắt đầu học ngay bên dưới.')
    } catch (error) {
      setEnrollMessage(getApiErrorMessage(error))
    } finally {
      setIsEnrolling(false)
    }
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border" role="status" />
      </div>
    )
  }

  if (errorMessage || !course) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{errorMessage ?? 'Không tìm thấy khoá học'}</div>
      </div>
    )
  }

  return (
    <div className="container py-5">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/courses">Khoá học</Link>
          </li>
          <li className="breadcrumb-item active">{course.title}</li>
        </ol>
      </nav>

      <h1 className="h3">{course.title}</h1>
      <p className="text-muted">
        {course.languageName}
        {course.difficulty && ` · ${course.difficulty}`}
        {course.estimatedMinutes != null && ` · ${course.estimatedMinutes} phút`}
      </p>
      {course.description && <p>{course.description}</p>}

      {enrollMessage && <div className="alert alert-info">{enrollMessage}</div>}

      {user ? (
        <button type="button" className="btn btn-primary mb-4" onClick={handleEnroll} disabled={isEnrolling}>
          {isEnrolling ? 'Đang ghi danh...' : 'Ghi danh khoá học'}
        </button>
      ) : (
        <button type="button" className="btn btn-primary mb-4" onClick={() => navigate('/login')}>
          Đăng nhập để ghi danh
        </button>
      )}

      <h2 className="h5">Danh sách bài học</h2>
      {course.lessons.length === 0 ? (
        <p className="text-muted">Chưa có bài học nào.</p>
      ) : (
        <ul className="list-group">
          {course.lessons.map((lesson) => (
            <li key={lesson.id} className="list-group-item d-flex justify-content-between align-items-center">
              <span>{lesson.title}</span>
              {lesson.estimatedMinutes != null && (
                <span className="text-muted small">{lesson.estimatedMinutes} phút</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default CourseDetailPage
