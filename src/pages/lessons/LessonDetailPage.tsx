import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  ImageIcon,
  ListChecks,
  LogIn,
  Volume2,
} from 'lucide-react'
import lessonService from '../../services/lessonService'
import { getApiErrorMessage } from '../../api/apiError'
import { useAuthContext } from '../../contexts/AuthContext'
import { Button, ButtonLink, Card, Skeleton } from '../../components/ui'
import type { LessonResponse } from '../../types/lesson'
import styles from './LessonDetailPage.module.scss'

function LessonDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isLoading: isAuthLoading } = useAuthContext()
  const [lesson, setLesson] = useState<LessonResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isCompleting, setIsCompleting] = useState(false)
  const [completeError, setCompleteError] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    // Đợi AuthContext khôi phục xong access token trước khi gọi API - nếu không, request đầu
    // tiên khi tải lại trang (F5) chạy trước khi accessToken kịp phục hồi từ refreshToken
    // cookie, khiến Backend coi là request ẩn danh và trả enrolled=false sai (Lesson bị "kẹt"
    // ở chế độ preview dù đã đăng nhập + đã ghi danh, do effect này không tự chạy lại).
    if (!id || isAuthLoading) return
    let ignore = false

    async function loadLesson() {
      setIsLoading(true)
      setErrorMessage(null)
      try {
        const data = await lessonService.getLessonById(Number(id))
        if (!ignore) setLesson(data)
      } catch (error) {
        if (!ignore) setErrorMessage(getApiErrorMessage(error))
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadLesson()
    return () => {
      ignore = true
    }
  }, [id, isAuthLoading])

  async function handleComplete() {
    if (!id) return
    setIsCompleting(true)
    setCompleteError(null)
    try {
      await lessonService.completeLesson(Number(id))
      setIsCompleted(true)
    } catch (error) {
      setCompleteError(getApiErrorMessage(error))
    } finally {
      setIsCompleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className={`container ${styles.page}`}>
        <Skeleton height={16} width={120} style={{ marginBottom: 24 }} />
        <Skeleton height={28} width="60%" style={{ marginBottom: 12 }} />
        <Skeleton height={16} style={{ marginBottom: 32 }} />
        <Skeleton height={220} style={{ marginBottom: 32 }} />
        <Skeleton height={120} />
      </div>
    )
  }

  if (errorMessage || !lesson) {
    return (
      <div className="container">
        <div className={styles.errorState}>
          <span className={styles.errorIcon}>
            <AlertCircle size={26} />
          </span>
          <p>{errorMessage ?? 'Không tìm thấy bài học'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`container ${styles.page}`}>
      <Link to={`/courses/${lesson.courseId}`} className={styles.backLink}>
        <ArrowLeft size={16} />
        Quay lại khoá học
      </Link>

      <div className={styles.header}>
        <h1 className={styles.title}>{lesson.title}</h1>
        {lesson.description && <p className={styles.description}>{lesson.description}</p>}
        <div className={styles.meta}>
          {lesson.estimatedMinutes != null && (
            <span className={styles.metaItem}>
              <Clock size={14} />
              {lesson.estimatedMinutes} phút
            </span>
          )}
          <span className={styles.metaItem}>
            <BookOpen size={14} />
            {lesson.vocabularies.length} từ vựng
          </span>
          <span className={styles.metaItem}>
            <GraduationCap size={14} />
            {lesson.grammars.length} điểm ngữ pháp
          </span>
        </div>
        <ButtonLink to={`/lessons/${lesson.id}/quiz`} size="sm" variant="outline" className={styles.quizButton} leftIcon={<ListChecks size={14} />}>
          Làm Quiz
        </ButtonLink>
      </div>

      {!lesson.enrolled && (
        <div className={styles.previewBanner}>
          <AlertCircle size={18} />
          <span>
            Bạn đang xem trước bài học này.{' '}
            <Link to={`/courses/${lesson.courseId}`}>Ghi danh khoá học</Link> để xem đầy đủ nội dung.
          </span>
        </div>
      )}

      {lesson.videoUrl && (
        <div className={styles.media}>
          <video src={lesson.videoUrl} controls preload="metadata" />
        </div>
      )}

      {lesson.audioUrl && (
        <Card padding="md" className={styles.audioCard}>
          <span className={styles.audioIcon}>
            <Volume2 size={20} />
          </span>
          <audio src={lesson.audioUrl} controls preload="metadata" />
        </Card>
      )}

      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <h2 className="h5" style={{ margin: 0 }}>
            Từ vựng
          </h2>
          <span className={styles.sectionCount}>{lesson.vocabularies.length}</span>
          {lesson.enrolled && lesson.vocabularies.length > 0 && (
            <ButtonLink to={`/lessons/${lesson.id}/vocabulary`} size="sm" variant="outline" className={styles.learnVocabButton}>
              Học từ vựng
            </ButtonLink>
          )}
        </div>
        {lesson.vocabularies.length === 0 ? (
          <Card>
            <p className={styles.emptySection}>
              {lesson.enrolled ? 'Bài học này chưa có từ vựng nào.' : 'Ghi danh khoá học để xem từ vựng.'}
            </p>
          </Card>
        ) : (
          <div className={styles.vocabGrid}>
            {lesson.vocabularies.map((vocab) => (
              <Card key={vocab.vocabularyId} padding="md" className={styles.vocabCard}>
                {vocab.imageUrl ? (
                  <img src={vocab.imageUrl} alt="" className={styles.vocabImage} />
                ) : (
                  <span className={styles.vocabImageFallback}>
                    <ImageIcon size={20} />
                  </span>
                )}
                <div className={styles.vocabBody}>
                  <div className={styles.vocabWordRow}>
                    <span className={styles.vocabWord}>{vocab.word}</span>
                    {vocab.ipa && <span className={styles.vocabIpa}>/{vocab.ipa}/</span>}
                  </div>
                  <div className={styles.vocabMeaning}>{vocab.meaning}</div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <h2 className="h5" style={{ margin: 0 }}>
            Ngữ pháp
          </h2>
          <span className={styles.sectionCount}>{lesson.grammars.length}</span>
        </div>
        {lesson.grammars.length === 0 ? (
          <Card>
            <p className={styles.emptySection}>
              {lesson.enrolled ? 'Bài học này chưa có điểm ngữ pháp nào.' : 'Ghi danh khoá học để xem ngữ pháp.'}
            </p>
          </Card>
        ) : (
          <div className={styles.grammarList}>
            {lesson.grammars.map((grammar) => (
              <Card key={grammar.id} padding="lg">
                <div className={styles.grammarHeader}>
                  <span className={styles.grammarTitle}>{grammar.title}</span>
                </div>
                {grammar.pattern && <div className={styles.grammarPattern}>{grammar.pattern}</div>}
                {grammar.explanation && <p className={styles.grammarExplanation}>{grammar.explanation}</p>}
                {grammar.examples.length > 0 && (
                  <div className={styles.exampleList}>
                    {grammar.examples.map((example) => (
                      <div className={styles.exampleItem} key={example.id}>
                        <div className={styles.exampleText}>{example.exampleText}</div>
                        {example.translation && <div className={styles.exampleTranslation}>{example.translation}</div>}
                        {example.note && <div className={styles.exampleNote}>{example.note}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      <Card padding="lg" className={styles.completeCard}>
        {isCompleted ? (
          <>
            <span className={styles.completeIcon}>
              <CheckCircle2 size={28} />
            </span>
            <h2 className="h5">Đã hoàn thành bài học!</h2>
            <p className={styles.completeText}>Tiếp tục với bài học tiếp theo trong khoá học.</p>
            <ButtonLink to={`/courses/${lesson.courseId}`}>Quay lại khoá học</ButtonLink>
          </>
        ) : !user ? (
          <>
            <p className={styles.completeText}>Đăng nhập để đánh dấu hoàn thành bài học này.</p>
            <Button onClick={() => navigate('/login')} leftIcon={<LogIn size={16} />}>
              Đăng nhập
            </Button>
          </>
        ) : !lesson.enrolled ? (
          <>
            <p className={styles.completeText}>Bạn cần ghi danh khoá học để hoàn thành bài học này.</p>
            <ButtonLink to={`/courses/${lesson.courseId}`}>Ghi danh khoá học</ButtonLink>
          </>
        ) : (
          <>
            <p className={styles.completeText}>Đã học xong? Đánh dấu hoàn thành để lưu tiến độ của bạn.</p>
            <Button onClick={handleComplete} isLoading={isCompleting} leftIcon={<CheckCircle2 size={16} />}>
              Hoàn thành bài học
            </Button>
            {completeError && <p className={styles.completeError}>{completeError}</p>}
          </>
        )}
      </Card>
    </div>
  )
}

export default LessonDetailPage
