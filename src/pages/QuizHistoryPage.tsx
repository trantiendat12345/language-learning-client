import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Clock, History, LogIn, XCircle } from 'lucide-react'
import quizService from '../services/quizService'
import lessonService from '../services/lessonService'
import { getApiErrorMessage } from '../api/apiError'
import { useAuthContext } from '../contexts/AuthContext'
import { ButtonLink, Card, Pagination, Skeleton } from '../components/ui'
import type { QuizAttemptResponse, QuizAttemptSummaryResponse } from '../types/quiz'
import styles from './QuizHistoryPage.module.scss'

const PAGE_SIZE = 10

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
}

function QuizHistoryPage() {
  const { user, isLoading: isAuthLoading } = useAuthContext()

  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [attempts, setAttempts] = useState<QuizAttemptSummaryResponse[]>([])
  const [lessonTitles, setLessonTitles] = useState<Map<number, string>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [detailCache, setDetailCache] = useState<Map<number, QuizAttemptResponse>>(new Map())
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  // Đợi AuthContext khôi phục xong access token - trang này yêu cầu đăng nhập hoàn toàn (mọi API
  // /api/quizzes/attempts đều protected), tránh gọi API sớm ở trạng thái ẩn danh khi F5.
  useEffect(() => {
    if (isAuthLoading) return
    let ignore = false

    async function loadAttempts() {
      if (!user) {
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      setErrorMessage(null)
      try {
        const data = await quizService.getAttempts({ page, size: PAGE_SIZE })
        if (ignore) return
        setAttempts(data.content)
        setTotalPages(data.totalPages)

        const uniqueLessonIds = Array.from(new Set(data.content.filter((a) => a.sourceType === 'LESSON').map((a) => a.sourceId)))
        const results = await Promise.allSettled(uniqueLessonIds.map((lessonId) => lessonService.getLessonById(lessonId)))
        if (ignore) return
        setLessonTitles((prev) => {
          const next = new Map(prev)
          results.forEach((result, index) => {
            if (result.status === 'fulfilled') next.set(uniqueLessonIds[index], result.value.title)
          })
          return next
        })
      } catch (error) {
        if (!ignore) setErrorMessage(getApiErrorMessage(error))
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadAttempts()
    return () => {
      ignore = true
    }
  }, [user, isAuthLoading, page])

  async function handleToggle(attemptId: number) {
    if (expandedId === attemptId) {
      setExpandedId(null)
      return
    }
    setExpandedId(attemptId)
    if (detailCache.has(attemptId)) return
    setIsLoadingDetail(true)
    setDetailError(null)
    try {
      const detail = await quizService.getAttemptById(attemptId)
      setDetailCache((prev) => new Map(prev).set(attemptId, detail))
    } catch (error) {
      setDetailError(getApiErrorMessage(error))
    } finally {
      setIsLoadingDetail(false)
    }
  }

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.header}>
        <span className={styles.headerIcon}>
          <History size={22} />
        </span>
        <div>
          <h1 className={styles.title}>Lịch sử làm Quiz</h1>
          <p className={styles.subtitle}>Xem lại kết quả các lần làm Quiz trước đây của bạn</p>
        </div>
      </div>

      {!user ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>
            <AlertCircle size={26} />
          </span>
          <p>Đăng nhập để xem lịch sử làm Quiz của bạn.</p>
          <ButtonLink to="/login" leftIcon={<LogIn size={16} />}>
            Đăng nhập
          </ButtonLink>
        </div>
      ) : errorMessage ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>
            <AlertCircle size={26} />
          </span>
          <p>{errorMessage}</p>
        </div>
      ) : isLoading ? (
        <>
          <Skeleton height={80} style={{ marginBottom: 12 }} />
          <Skeleton height={80} style={{ marginBottom: 12 }} />
          <Skeleton height={80} />
        </>
      ) : attempts.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>
            <History size={26} />
          </span>
          <p>Bạn chưa làm Quiz nào.</p>
        </div>
      ) : (
        <>
          <div className={styles.list}>
            {attempts.map((attempt) => {
              const isExpanded = expandedId === attempt.id
              const detail = detailCache.get(attempt.id)
              const lessonTitle =
                attempt.sourceType === 'LESSON' ? (lessonTitles.get(attempt.sourceId) ?? `Bài học #${attempt.sourceId}`) : attempt.sourceType

              return (
                <Card key={attempt.id} padding="none" className={styles.item}>
                  <button type="button" className={styles.itemHeader} onClick={() => handleToggle(attempt.id)}>
                    <div className={styles.itemMain}>
                      <span className={styles.itemTitle}>{lessonTitle}</span>
                      <span className={styles.itemMeta}>
                        <Clock size={12} /> {formatDate(attempt.completedAt)}
                      </span>
                    </div>
                    <div className={styles.itemStats}>
                      <span className={styles.itemAccuracy}>{Math.round(attempt.accuracy)}%</span>
                      <span className={styles.itemScore}>
                        {attempt.correctAnswers}/{attempt.totalQuestions}
                      </span>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className={styles.itemDetail}>
                      {isLoadingDetail && !detail ? (
                        <Skeleton height={60} />
                      ) : detailError && !detail ? (
                        <p className={styles.detailError}>{detailError}</p>
                      ) : detail ? (
                        <div className={styles.detailList}>
                          {detail.answers.map((answer, index) => (
                            <div key={answer.questionId} className={styles.detailRow}>
                              <span className={answer.correct ? styles.detailCorrect : styles.detailWrong}>
                                {answer.correct ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                              </span>
                              <div className={styles.detailBody}>
                                <span className={styles.detailPrompt}>
                                  Câu {index + 1}: {answer.promptText}
                                </span>
                                {answer.typedAnswer && <span className={styles.detailAnswer}>Bạn trả lời: {answer.typedAnswer}</span>}
                                {answer.explanation && <span className={styles.detailExplanation}>{answer.explanation}</span>}
                              </div>
                            </div>
                          ))}
                          <p className={styles.detailNote}>
                            Lưu ý: với câu trắc nghiệm, hệ thống chỉ lưu đúng/sai - không lưu lại nội dung lựa chọn đã chọn.
                          </p>
                        </div>
                      ) : null}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <Link to="/courses" className={styles.backLink}>
        Quay lại Khoá học
      </Link>
    </div>
  )
}

export default QuizHistoryPage
