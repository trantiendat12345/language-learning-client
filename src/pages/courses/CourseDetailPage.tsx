import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, BarChart3, BookOpen, CheckCircle2, Clock, Globe, LogIn } from 'lucide-react'
import courseService from '../../services/courseService'
import { getApiErrorMessage } from '../../api/apiError'
import { useAuthContext } from '../../contexts/AuthContext'
import { Badge, Button, Card, Skeleton } from '../../components/ui'
import type { CourseResponse } from '../../types/course'
import styles from './CourseDetailPage.module.scss'

function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const [course, setCourse] = useState<CourseResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [enrollMessage, setEnrollMessage] = useState<string | null>(null)
  const [enrollFailed, setEnrollFailed] = useState(false)

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
    setEnrollFailed(false)
    try {
      await courseService.enrollInCourse(Number(id))
      setEnrollMessage('Ghi danh thành công! Bắt đầu học ngay bên dưới.')
    } catch (error) {
      setEnrollMessage(getApiErrorMessage(error))
      setEnrollFailed(true)
    } finally {
      setIsEnrolling(false)
    }
  }

  if (isLoading) {
    return (
      <div className={`container ${styles.page}`}>
        <Skeleton height={280} style={{ borderRadius: 28, marginBottom: 32 }} />
        <div className={styles.layout}>
          <div>
            <Skeleton height={24} width="40%" style={{ marginBottom: 16 }} />
            <Skeleton height={16} style={{ marginBottom: 8 }} />
            <Skeleton height={16} width="80%" />
          </div>
          <Skeleton height={220} />
        </div>
      </div>
    )
  }

  if (errorMessage || !course) {
    return (
      <div className="container">
        <div className={styles.errorState}>
          <span className={styles.errorIcon}>
            <AlertCircle size={26} />
          </span>
          <p>{errorMessage ?? 'Không tìm thấy khoá học'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`container ${styles.page}`}>
      <nav className={styles.breadcrumb} aria-label="breadcrumb">
        <Link to="/courses">Khoá học</Link>
        <span>/</span>
        <span>{course.title}</span>
      </nav>

      <div className={styles.hero}>
        {course.thumbnailUrl && <img src={course.thumbnailUrl} alt="" className={styles.heroImage} />}
        <span className={styles.heroOverlay} aria-hidden="true" />
        <div className={styles.heroContent}>
          <div className={styles.heroBadges}>
            <Badge variant="secondary" icon={<Globe size={11} />}>
              {course.languageName}
            </Badge>
            {course.difficulty && <Badge variant="primary">{course.difficulty}</Badge>}
          </div>
          <h1 className={styles.heroTitle}>{course.title}</h1>
          <div className={styles.heroMeta}>
            {course.estimatedMinutes != null && (
              <span className={styles.heroMetaItem}>
                <Clock size={15} />
                {course.estimatedMinutes} phút
              </span>
            )}
            <span className={styles.heroMetaItem}>
              <BookOpen size={15} />
              {course.lessons.length} bài học
            </span>
          </div>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.main}>
          {course.description && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Giới thiệu khoá học</h2>
              <p className={styles.description}>{course.description}</p>
            </div>
          )}

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Nội dung khoá học</h2>
            {course.lessons.length === 0 ? (
              <Card>
                <p className={styles.emptyLessons}>Chưa có bài học nào.</p>
              </Card>
            ) : (
              <div className={styles.lessonList}>
                {course.lessons.map((lesson, index) => (
                  <Card key={lesson.id} padding="md" className={styles.lessonItem}>
                    <span className={styles.lessonIndex}>{index + 1}</span>
                    <div className={styles.lessonBody}>
                      <div className={styles.lessonTitle}>{lesson.title}</div>
                      {lesson.estimatedMinutes != null && (
                        <div className={styles.lessonMeta}>
                          <Clock size={12} />
                          {lesson.estimatedMinutes} phút
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.sidebar}>
          <Card padding="lg" className={styles.sidebarCard}>
            <div className={styles.statRow}>
              <span className={styles.statIcon}>
                <Globe size={16} />
              </span>
              <span className={styles.statLabel}>Ngôn ngữ</span>
              <span className={styles.statValue}>{course.languageName}</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statIcon}>
                <BarChart3 size={16} />
              </span>
              <span className={styles.statLabel}>Trình độ</span>
              <span className={styles.statValue}>{course.difficulty ?? '—'}</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statIcon}>
                <Clock size={16} />
              </span>
              <span className={styles.statLabel}>Thời lượng</span>
              <span className={styles.statValue}>{course.estimatedMinutes ?? '—'} phút</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statIcon}>
                <BookOpen size={16} />
              </span>
              <span className={styles.statLabel}>Số bài học</span>
              <span className={styles.statValue}>{course.lessons.length}</span>
            </div>

            {user ? (
              <Button
                fullWidth
                className={styles.enrollButton}
                onClick={handleEnroll}
                isLoading={isEnrolling}
                leftIcon={<CheckCircle2 size={16} />}
              >
                Ghi danh khoá học
              </Button>
            ) : (
              <Button
                fullWidth
                className={styles.enrollButton}
                onClick={() => navigate('/login')}
                leftIcon={<LogIn size={16} />}
              >
                Đăng nhập để ghi danh
              </Button>
            )}

            {enrollMessage && (
              <div
                className={styles.enrollBanner}
                style={enrollFailed ? { backgroundColor: 'var(--dl-danger-50)', color: 'var(--dl-danger-600)' } : undefined}
              >
                {enrollFailed ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                {enrollMessage}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CourseDetailPage
