import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, CheckCircle2, ImageIcon, LogIn, PartyPopper } from 'lucide-react'
import reviewService from '../services/reviewService'
import { getApiErrorMessage } from '../api/apiError'
import { useAuthContext } from '../contexts/AuthContext'
import { Badge, ButtonLink, Skeleton } from '../components/ui'
import type { ReviewRating, ReviewTodayItemResponse } from '../types/review'
import styles from './ReviewPage.module.scss'

const RATING_OPTIONS: { rating: ReviewRating; label: string; className: string }[] = [
  { rating: 'FORGOT', label: 'Quên rồi', className: styles.forgot },
  { rating: 'HARD', label: 'Khó', className: styles.hard },
  { rating: 'GOOD', label: 'Tốt', className: styles.good },
  { rating: 'EASY', label: 'Dễ', className: styles.easy },
]

function ReviewPage() {
  const { user, isLoading: isAuthLoading } = useAuthContext()

  const [items, setItems] = useState<ReviewTodayItemResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [ratingCounts, setRatingCounts] = useState<Record<ReviewRating, number>>({
    FORGOT: 0,
    HARD: 0,
    GOOD: 0,
    EASY: 0,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Đợi AuthContext khôi phục xong access token - GET /api/review/today yêu cầu đăng nhập hoàn
  // toàn, tránh gọi API sớm ở trạng thái ẩn danh khi F5 (CODING_CONVENTIONS.md mục 2.2).
  useEffect(() => {
    if (isAuthLoading) return
    let ignore = false

    async function loadItems() {
      if (!user) {
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      setErrorMessage(null)
      try {
        const data = await reviewService.getTodayReview()
        if (!ignore) setItems(data)
      } catch (error) {
        if (!ignore) setErrorMessage(getApiErrorMessage(error))
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadItems()
    return () => {
      ignore = true
    }
  }, [user, isAuthLoading])

  const isCompleted = items.length > 0 && currentIndex >= items.length
  const currentItem = !isCompleted ? items[currentIndex] : null
  const totalRated = Object.values(ratingCounts).reduce((sum, n) => sum + n, 0)

  async function handleRate(rating: ReviewRating) {
    if (!currentItem) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await reviewService.submitReview(currentItem.vocabularyId, rating)
      setRatingCounts((prev) => ({ ...prev, [rating]: prev[rating] + 1 }))
      setCurrentIndex((i) => i + 1)
      setIsFlipped(false)
    } catch (error) {
      setSubmitError(getApiErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.header}>
        <h1>Ôn tập hôm nay</h1>
        <p className={styles.subtitle}>Ôn lại những từ vựng đã đến hạn theo lịch lặp lại ngắt quãng (SRS)</p>
      </div>

      {!user ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>
            <AlertCircle size={26} />
          </span>
          <p>Đăng nhập để xem danh sách từ cần ôn tập hôm nay.</p>
          <ButtonLink to="/login" leftIcon={<LogIn size={16} />}>
            Đăng nhập
          </ButtonLink>
        </div>
      ) : isLoading ? (
        <Skeleton height={340} style={{ borderRadius: 24 }} />
      ) : errorMessage ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>
            <AlertCircle size={26} />
          </span>
          <p>{errorMessage}</p>
        </div>
      ) : items.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIconSuccess}>
            <PartyPopper size={28} />
          </span>
          <p>Không có từ nào cần ôn tập hôm nay. Bạn đã ôn hết rồi!</p>
          <div className={styles.emptyActions}>
            <ButtonLink to="/decks">Học thêm từ vựng</ButtonLink>
            <ButtonLink to="/dashboard" variant="outline">
              Về Dashboard
            </ButtonLink>
          </div>
        </div>
      ) : isCompleted ? (
        <div className={styles.completeCard}>
          <span className={styles.completeIcon}>
            <CheckCircle2 size={28} />
          </span>
          <h2 className="h5">Đã ôn xong {items.length} từ hôm nay!</h2>
          <div className={styles.summaryRow}>
            {RATING_OPTIONS.map((option) => (
              <span key={option.rating} className={`${styles.summaryPill} ${option.className}`}>
                {option.label}: {ratingCounts[option.rating]}
              </span>
            ))}
          </div>
          <div className={styles.completeActions}>
            <ButtonLink to="/dashboard">Về Dashboard</ButtonLink>
            <ButtonLink to="/decks" variant="outline">
              Học thêm từ vựng
            </ButtonLink>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.progress}>
            {totalRated + 1}/{items.length}
          </div>

          <div className={styles.stage}>
            <div
              className={`${styles.card} ${isFlipped ? styles.flipped : ''}`}
              onClick={() => setIsFlipped((f) => !f)}
              role="button"
              tabIndex={0}
              aria-label="Lật thẻ"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setIsFlipped((f) => !f)
              }}
            >
              <div className={`${styles.face} ${styles.faceFront}`}>
                {currentItem?.imageUrl ? (
                  <img src={currentItem.imageUrl} alt="" className={styles.cardImage} />
                ) : (
                  <span className={styles.cardImageFallback}>
                    <ImageIcon size={28} />
                  </span>
                )}
                <span className={styles.cardText}>{currentItem?.word}</span>
                {currentItem?.ipa && <span className={styles.cardIpa}>/{currentItem.ipa}/</span>}
                {currentItem?.wordType && (
                  <Badge variant="neutral" className={styles.cardBadge}>
                    {currentItem.wordType}
                  </Badge>
                )}
                <span className={styles.flipHint}>Bấm để xem nghĩa</span>
              </div>
              <div className={`${styles.face} ${styles.faceBack}`}>
                <span className={styles.cardText}>{currentItem?.meaning}</span>
              </div>
            </div>
          </div>

          <div className={styles.ratingRow}>
            {RATING_OPTIONS.map((option) => (
              <button
                key={option.rating}
                type="button"
                className={`${styles.ratingButton} ${option.className}`}
                disabled={!isFlipped || isSubmitting}
                onClick={() => handleRate(option.rating)}
              >
                {option.label}
              </button>
            ))}
          </div>
          {!isFlipped && <p className={styles.ratingHint}>Lật thẻ để xem nghĩa và đánh giá mức độ nhớ</p>}
          {submitError && <p className={styles.ratingError}>{submitError}</p>}
        </>
      )}

      <Link to="/dashboard" className={styles.backLink}>
        Quay lại Dashboard
      </Link>
    </div>
  )
}

export default ReviewPage
