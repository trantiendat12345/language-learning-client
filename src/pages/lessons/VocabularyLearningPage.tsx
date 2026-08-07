import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, CheckCircle2, ImageIcon, LogIn, Volume2 } from 'lucide-react'
import lessonService from '../../services/lessonService'
import vocabularyService from '../../services/vocabularyService'
import reviewService from '../../services/reviewService'
import { getApiErrorMessage } from '../../api/apiError'
import { useAuthContext } from '../../contexts/AuthContext'
import { Badge, Button, ButtonLink, Card, ProgressRing, Skeleton } from '../../components/ui'
import type { LessonResponse } from '../../types/lesson'
import type { MasteryLevel } from '../../types/review'
import styles from './VocabularyLearningPage.module.scss'

interface LearningWord {
  vocabularyId: number
  word: string
  meaning: string
  ipa: string | null
  imageUrl: string | null
  wordType: string | null
  pronunciationAudioUrl: string | null
  exampleSentence: string | null
  exampleTranslation: string | null
}

const MASTERY_LABEL: Record<MasteryLevel, string> = {
  NEW: 'Mới học',
  LEARNING: 'Đang học',
  FAMILIAR: 'Quen thuộc',
  MASTERED: 'Thành thạo',
}

function playAudio(url: string) {
  new Audio(url).play().catch(() => {})
}

function VocabularyLearningPage() {
  const { id } = useParams<{ id: string }>()
  const { user, isLoading: isAuthLoading } = useAuthContext()
  const [lesson, setLesson] = useState<LessonResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [words, setWords] = useState<LearningWord[]>([])
  const [isLoadingWords, setIsLoadingWords] = useState(false)

  const [learnedResults, setLearnedResults] = useState<Map<number, MasteryLevel>>(new Map())
  const [markingId, setMarkingId] = useState<number | null>(null)
  const [markError, setMarkError] = useState<string | null>(null)

  // Đợi AuthContext khôi phục xong access token trước khi gọi API - trang public nhưng gating
  // theo enrolled (xem quy tắc bắt buộc ở CODING_CONVENTIONS.md mục 2.2, phát hiện qua bug thật
  // ở LessonDetailPage).
  useEffect(() => {
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

  // LessonVocabularyResponse không có audio/câu ví dụ - lấy thêm chi tiết từng từ qua
  // GET /api/vocabularies/{id} (public, chạy song song). Nếu 1 từ fetch lỗi, vẫn hiển thị
  // được với dữ liệu tóm tắt đã có từ Lesson thay vì làm hỏng cả danh sách.
  useEffect(() => {
    let ignore = false

    async function loadWordDetails() {
      if (!lesson || !lesson.enrolled || lesson.vocabularies.length === 0) {
        setWords([])
        return
      }
      setIsLoadingWords(true)
      const results = await Promise.allSettled(
        lesson.vocabularies.map((vocab) => vocabularyService.getVocabularyById(vocab.vocabularyId)),
      )
      if (ignore) return
      const merged = lesson.vocabularies.map((vocab, index) => {
        const result = results[index]
        if (result.status === 'fulfilled') {
          return {
            vocabularyId: vocab.vocabularyId,
            word: result.value.word,
            meaning: result.value.meaning,
            ipa: result.value.ipa,
            imageUrl: result.value.imageUrl,
            wordType: result.value.wordType,
            pronunciationAudioUrl: result.value.pronunciationAudioUrl,
            exampleSentence: result.value.exampleSentence,
            exampleTranslation: result.value.exampleTranslation,
          }
        }
        return {
          vocabularyId: vocab.vocabularyId,
          word: vocab.word,
          meaning: vocab.meaning,
          ipa: vocab.ipa,
          imageUrl: vocab.imageUrl,
          wordType: vocab.wordType,
          pronunciationAudioUrl: null,
          exampleSentence: null,
          exampleTranslation: null,
        }
      })
      setWords(merged)
      setIsLoadingWords(false)
    }

    loadWordDetails()
    return () => {
      ignore = true
    }
  }, [lesson])

  async function handleMarkLearned(vocabularyId: number) {
    setMarkingId(vocabularyId)
    setMarkError(null)
    try {
      const result = await reviewService.submitReview(vocabularyId, 'GOOD')
      setLearnedResults((prev) => new Map(prev).set(vocabularyId, result.masteryLevel))
    } catch (error) {
      setMarkError(getApiErrorMessage(error))
    } finally {
      setMarkingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className={`container ${styles.page}`}>
        <Skeleton height={16} width={120} style={{ marginBottom: 24 }} />
        <Skeleton height={28} width="60%" style={{ marginBottom: 32 }} />
        <Skeleton height={140} style={{ marginBottom: 16 }} />
        <Skeleton height={140} style={{ marginBottom: 16 }} />
        <Skeleton height={140} />
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

  const learnedCount = learnedResults.size
  const totalCount = words.length
  const allLearned = totalCount > 0 && learnedCount === totalCount

  return (
    <div className={`container ${styles.page}`}>
      <Link to={`/lessons/${lesson.id}`} className={styles.backLink}>
        <ArrowLeft size={16} />
        Quay lại bài học
      </Link>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Học từ vựng</h1>
          <p className={styles.subtitle}>{lesson.title}</p>
        </div>
        {totalCount > 0 && (
          <ProgressRing percent={(learnedCount / totalCount) * 100} size={64} strokeWidth={6}>
            <span className={styles.ringLabel}>
              {learnedCount}/{totalCount}
            </span>
          </ProgressRing>
        )}
      </div>

      {!user ? (
        <div className={styles.gateBanner}>
          <AlertCircle size={18} />
          <span>Đăng nhập để học từ vựng và lưu tiến độ của bạn.</span>
          <ButtonLink to="/login" size="sm" leftIcon={<LogIn size={14} />}>
            Đăng nhập
          </ButtonLink>
        </div>
      ) : !lesson.enrolled ? (
        <div className={styles.gateBanner}>
          <AlertCircle size={18} />
          <span>Ghi danh khoá học để học từ vựng của bài học này.</span>
          <ButtonLink to={`/courses/${lesson.courseId}`} size="sm">
            Ghi danh khoá học
          </ButtonLink>
        </div>
      ) : isLoadingWords ? (
        <>
          <Skeleton height={140} style={{ marginBottom: 16 }} />
          <Skeleton height={140} style={{ marginBottom: 16 }} />
          <Skeleton height={140} />
        </>
      ) : words.length === 0 ? (
        <Card>
          <p className={styles.emptyState}>Bài học này chưa có từ vựng nào.</p>
        </Card>
      ) : (
        <>
          <div className={styles.wordList}>
            {words.map((w) => {
              const mastery = learnedResults.get(w.vocabularyId)
              return (
                <Card key={w.vocabularyId} padding="lg" className={styles.wordCard}>
                  {w.imageUrl ? (
                    <img src={w.imageUrl} alt="" className={styles.wordImage} />
                  ) : (
                    <span className={styles.wordImageFallback}>
                      <ImageIcon size={24} />
                    </span>
                  )}
                  <div className={styles.wordBody}>
                    <div className={styles.wordHeadRow}>
                      <span className={styles.wordText}>{w.word}</span>
                      {w.ipa && <span className={styles.wordIpa}>/{w.ipa}/</span>}
                      {w.wordType && <Badge variant="neutral">{w.wordType}</Badge>}
                      {w.pronunciationAudioUrl && (
                        <button
                          type="button"
                          className={styles.playButton}
                          onClick={() => playAudio(w.pronunciationAudioUrl!)}
                          aria-label={`Nghe phát âm ${w.word}`}
                        >
                          <Volume2 size={15} />
                        </button>
                      )}
                    </div>
                    <p className={styles.wordMeaning}>{w.meaning}</p>
                    {w.exampleSentence && (
                      <div className={styles.wordExample}>
                        <p className={styles.exampleText}>{w.exampleSentence}</p>
                        {w.exampleTranslation && <p className={styles.exampleTranslation}>{w.exampleTranslation}</p>}
                      </div>
                    )}
                    <div className={styles.wordAction}>
                      {mastery ? (
                        <Badge variant="success" icon={<CheckCircle2 size={12} />}>
                          Đã học · {MASTERY_LABEL[mastery]}
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkLearned(w.vocabularyId)}
                          isLoading={markingId === w.vocabularyId}
                          leftIcon={<CheckCircle2 size={14} />}
                        >
                          Đánh dấu đã học
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
          {markError && <p className={styles.markError}>{markError}</p>}

          {allLearned && (
            <Card padding="lg" className={styles.completeCard}>
              <span className={styles.completeIcon}>
                <CheckCircle2 size={28} />
              </span>
              <h2 className="h5">Đã học hết từ vựng bài này!</h2>
              <p className={styles.completeText}>Tiếp tục hoàn thành bài học hoặc ôn tập lại sau.</p>
              <ButtonLink to={`/lessons/${lesson.id}`}>Quay lại bài học</ButtonLink>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

export default VocabularyLearningPage
