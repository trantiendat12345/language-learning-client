import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  History,
  LogIn,
  RotateCcw,
  Sparkles,
  Volume2,
  XCircle,
} from 'lucide-react'
import lessonService from '../../services/lessonService'
import quizService from '../../services/quizService'
import { getApiErrorMessage } from '../../api/apiError'
import { useAuthContext } from '../../contexts/AuthContext'
import { Button, ButtonLink, Card, Input, Skeleton } from '../../components/ui'
import type { LessonResponse } from '../../types/lesson'
import type { QuestionType, QuizAttemptResponse, QuizQuestionResponse } from '../../types/quiz'
import styles from './QuizPage.module.scss'

type Stage = 'setup' | 'taking' | 'result'

const COUNT_OPTIONS: { label: string; value: number | undefined }[] = [
  { label: '10 câu', value: 10 },
  { label: '20 câu', value: 20 },
  { label: '50 câu', value: 50 },
  { label: 'Tất cả', value: undefined },
]

const OPTION_BASED_TYPES: QuestionType[] = ['MULTIPLE_CHOICE', 'IMAGE_CHOICE', 'AUDIO_CHOICE']
const TEXT_BASED_TYPES: QuestionType[] = ['FILL_BLANK', 'TYPING']

interface LocalAnswer {
  selectedOptionId?: number
  typedAnswer?: string
}

function playAudio(url: string) {
  new Audio(url).play().catch(() => {})
}

function QuizPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthContext()

  const [lesson, setLesson] = useState<LessonResponse | null>(null)
  const [isLoadingLesson, setIsLoadingLesson] = useState(true)
  const [lessonError, setLessonError] = useState<string | null>(null)

  const [stage, setStage] = useState<Stage>('setup')
  const [questionCount, setQuestionCount] = useState<number | undefined>(10)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)

  const [questions, setQuestions] = useState<QuizQuestionResponse[]>([])
  const [requestedCount, setRequestedCount] = useState(0)
  const [actualCount, setActualCount] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Map<number, LocalAnswer>>(new Map())
  const startedAtRef = useRef<number>(0)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [attemptResult, setAttemptResult] = useState<QuizAttemptResponse | null>(null)

  // GET /api/lessons/{id} public - chỉ cần tiêu đề + courseId để hiển thị header/back-link, không
  // liên quan gating enrolled nên không cần đợi isAuthLoading (khác LessonDetailPage/VocabularyLearningPage).
  useEffect(() => {
    if (!id) return
    let ignore = false

    async function loadLesson() {
      setIsLoadingLesson(true)
      setLessonError(null)
      try {
        const data = await lessonService.getLessonById(Number(id))
        if (!ignore) setLesson(data)
      } catch (error) {
        if (!ignore) setLessonError(getApiErrorMessage(error))
      } finally {
        if (!ignore) setIsLoadingLesson(false)
      }
    }

    loadLesson()
    return () => {
      ignore = true
    }
  }, [id])

  async function handleStart() {
    if (!id) return
    setIsGenerating(true)
    setGenerateError(null)
    try {
      const data = await quizService.generateQuiz({
        sourceType: 'LESSON',
        sourceId: Number(id),
        questionCount,
      })
      setQuestions(data.questions)
      setRequestedCount(data.requestedCount)
      setActualCount(data.actualCount)
      setCurrentIndex(0)
      setAnswers(new Map())
      setAttemptResult(null)
      startedAtRef.current = Date.now()
      setStage('taking')
    } catch (error) {
      setGenerateError(getApiErrorMessage(error))
    } finally {
      setIsGenerating(false)
    }
  }

  const currentQuestion = questions[currentIndex]
  const currentAnswer = currentQuestion ? answers.get(currentQuestion.id) : undefined
  const isLastQuestion = currentIndex === questions.length - 1
  const canProceed = currentQuestion
    ? OPTION_BASED_TYPES.includes(currentQuestion.type)
      ? currentAnswer?.selectedOptionId != null
      : TEXT_BASED_TYPES.includes(currentQuestion.type)
        ? !!currentAnswer?.typedAnswer?.trim()
        : true
    : false

  function updateAnswer(questionId: number, patch: LocalAnswer) {
    setAnswers((prev) => {
      const next = new Map(prev)
      next.set(questionId, { ...next.get(questionId), ...patch })
      return next
    })
  }

  async function handleNext() {
    if (isLastQuestion) {
      await handleSubmit()
      return
    }
    setCurrentIndex((i) => i + 1)
  }

  function handleSkip() {
    if (isLastQuestion) {
      handleSubmit()
      return
    }
    setCurrentIndex((i) => i + 1)
  }

  async function handleSubmit() {
    if (!id) return
    setIsSubmitting(true)
    setSubmitError(null)
    const durationSeconds = Math.max(0, Math.round((Date.now() - startedAtRef.current) / 1000))
    try {
      const result = await quizService.submitQuiz({
        sourceType: 'LESSON',
        sourceId: Number(id),
        durationSeconds,
        answers: questions.map((q) => {
          const a = answers.get(q.id)
          return { questionId: q.id, selectedOptionId: a?.selectedOptionId, typedAnswer: a?.typedAnswer }
        }),
      })
      setAttemptResult(result)
      setStage('result')
    } catch (error) {
      setSubmitError(getApiErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleRestart() {
    setStage('setup')
    setQuestions([])
    setAnswers(new Map())
    setAttemptResult(null)
    setGenerateError(null)
    setSubmitError(null)
  }

  if (isLoadingLesson) {
    return (
      <div className={`container ${styles.page}`}>
        <Skeleton height={16} width={120} style={{ marginBottom: 24 }} />
        <Skeleton height={28} width="50%" style={{ marginBottom: 32 }} />
        <Skeleton height={200} />
      </div>
    )
  }

  if (lessonError || !lesson) {
    return (
      <div className="container">
        <div className={styles.errorState}>
          <span className={styles.errorIcon}>
            <AlertCircle size={26} />
          </span>
          <p>{lessonError ?? 'Không tìm thấy bài học'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`container ${styles.page}`}>
      <Link to={`/lessons/${lesson.id}`} className={styles.backLink}>
        <ArrowLeft size={16} />
        Quay lại bài học
      </Link>

      {stage !== 'result' && (
        <div className={styles.header}>
          <h1 className={styles.title}>Quiz: {lesson.title}</h1>
        </div>
      )}

      {!user ? (
        <Card padding="lg" className={styles.setupCard}>
          <p className={styles.setupText}>Đăng nhập để làm Quiz và lưu lại kết quả của bạn.</p>
          <ButtonLink to="/login" leftIcon={<LogIn size={16} />}>
            Đăng nhập
          </ButtonLink>
        </Card>
      ) : stage === 'setup' ? (
        <Card padding="lg" className={styles.setupCard}>
          <p className={styles.setupText}>Chọn số câu hỏi bạn muốn làm:</p>
          <div className={styles.countOptions}>
            {COUNT_OPTIONS.map((option) => (
              <button
                key={option.label}
                type="button"
                className={`${styles.countButton} ${questionCount === option.value ? styles.countButtonActive : ''}`}
                onClick={() => setQuestionCount(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <Button onClick={handleStart} isLoading={isGenerating} leftIcon={<Sparkles size={16} />}>
            Bắt đầu làm Quiz
          </Button>
          {generateError && <p className={styles.errorText}>{generateError}</p>}
        </Card>
      ) : stage === 'taking' && actualCount === 0 ? (
        <Card padding="lg" className={styles.setupCard}>
          <p className={styles.setupText}>Bài học này chưa có câu hỏi Quiz nào.</p>
          <ButtonLink to={`/lessons/${lesson.id}`} variant="outline">
            Quay lại bài học
          </ButtonLink>
        </Card>
      ) : stage === 'taking' && currentQuestion ? (
        <>
          {requestedCount > actualCount && currentIndex === 0 && (
            <div className={styles.warningBanner}>
              <AlertCircle size={16} />
              Bài học chỉ có {actualCount} câu hỏi (bạn chọn {requestedCount}), đã dùng toàn bộ {actualCount} câu.
            </div>
          )}

          <div className={styles.progress}>
            Câu {currentIndex + 1}/{questions.length}
          </div>

          <Card padding="lg" className={styles.questionCard}>
            {currentQuestion.promptImageUrl && (
              <img src={currentQuestion.promptImageUrl} alt="" className={styles.promptImage} />
            )}
            {currentQuestion.promptText && <p className={styles.promptText}>{currentQuestion.promptText}</p>}
            {currentQuestion.promptAudioUrl && (
              <button
                type="button"
                className={styles.playButton}
                onClick={() => playAudio(currentQuestion.promptAudioUrl!)}
              >
                <Volume2 size={16} /> Nghe
              </button>
            )}

            {OPTION_BASED_TYPES.includes(currentQuestion.type) ? (
              <div className={styles.optionList}>
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`${styles.optionButton} ${currentAnswer?.selectedOptionId === option.id ? styles.optionSelected : ''}`}
                    onClick={() => updateAnswer(currentQuestion.id, { selectedOptionId: option.id })}
                  >
                    {option.optionImageUrl && <img src={option.optionImageUrl} alt="" className={styles.optionImage} />}
                    {option.optionText && <span>{option.optionText}</span>}
                  </button>
                ))}
              </div>
            ) : TEXT_BASED_TYPES.includes(currentQuestion.type) ? (
              <Input
                placeholder="Nhập câu trả lời..."
                value={currentAnswer?.typedAnswer ?? ''}
                onChange={(e) => updateAnswer(currentQuestion.id, { typedAnswer: e.target.value })}
                className={styles.textAnswer}
              />
            ) : (
              <p className={styles.unsupportedNote}>Loại câu hỏi này hiện chưa hỗ trợ làm bài trực tiếp - bấm "Bỏ qua" để tiếp tục.</p>
            )}
          </Card>

          <div className={styles.actionsRow}>
            <button type="button" className={styles.skipButton} onClick={handleSkip}>
              Bỏ qua câu này
            </button>
            <Button onClick={handleNext} disabled={!canProceed} isLoading={isSubmitting}>
              {isLastQuestion ? 'Nộp bài' : 'Tiếp theo'}
            </Button>
          </div>
          {submitError && <p className={styles.errorText}>{submitError}</p>}
        </>
      ) : stage === 'result' && attemptResult ? (
        <>
          <div className={styles.resultHeader}>
            <span className={styles.resultIcon}>
              <CheckCircle2 size={28} />
            </span>
            <h1 className="h4">Kết quả Quiz</h1>
            <p className={styles.resultSubtitle}>{lesson.title}</p>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <span className={styles.statValue}>{Math.round(attemptResult.accuracy)}%</span>
              <span className={styles.statLabel}>Độ chính xác</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statValue}>
                {attemptResult.correctAnswers}/{attemptResult.totalQuestions}
              </span>
              <span className={styles.statLabel}>Câu đúng</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statValue}>+{attemptResult.xpEarned}</span>
              <span className={styles.statLabel}>XP</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statValue}>
                <Clock size={16} style={{ verticalAlign: -2 }} /> {attemptResult.durationSeconds}s
              </span>
              <span className={styles.statLabel}>Thời gian</span>
            </div>
          </div>

          <div className={styles.reviewList}>
            {attemptResult.answers.map((answer, index) => {
              const question = questions.find((q) => q.id === answer.questionId)
              const userOption = question?.options.find((o) => o.id === answer.selectedOptionId)
              const correctOption = question?.options.find((o) => o.id === answer.correctOptionId)
              const isTextType = TEXT_BASED_TYPES.includes(answer.type)

              return (
                <Card key={answer.questionId} padding="md" className={styles.reviewItem}>
                  <div className={styles.reviewHeader}>
                    <span className={answer.correct ? styles.reviewCorrect : styles.reviewWrong}>
                      {answer.correct ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    </span>
                    <span className={styles.reviewQuestionNo}>Câu {index + 1}</span>
                  </div>
                  {answer.promptText && <p className={styles.reviewPrompt}>{answer.promptText}</p>}
                  <p className={styles.reviewAnswerLine}>
                    Bạn trả lời:{' '}
                    <strong>{isTextType ? answer.typedAnswer || '(bỏ qua)' : userOption?.optionText || '(bỏ qua)'}</strong>
                  </p>
                  {!answer.correct && !isTextType && correctOption && (
                    <p className={styles.reviewAnswerLine}>
                      Đáp án đúng: <strong>{correctOption.optionText}</strong>
                    </p>
                  )}
                  {answer.explanation && <p className={styles.reviewExplanation}>{answer.explanation}</p>}
                </Card>
              )
            })}
          </div>

          <div className={styles.resultActions}>
            <Button onClick={handleRestart} leftIcon={<RotateCcw size={16} />}>
              Làm lại
            </Button>
            <ButtonLink to="/quiz-history" variant="outline" leftIcon={<History size={16} />}>
              Xem lịch sử làm Quiz
            </ButtonLink>
            <ButtonLink to={`/lessons/${lesson.id}`} variant="ghost">
              Quay lại bài học
            </ButtonLink>
          </div>
        </>
      ) : null}
    </div>
  )
}

export default QuizPage
