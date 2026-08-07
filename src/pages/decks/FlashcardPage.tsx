import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertCircle, CheckCircle2, RotateCcw, Shuffle, Volume2 } from 'lucide-react'
import deckService from '../../services/deckService'
import reviewService from '../../services/reviewService'
import { getApiErrorMessage } from '../../api/apiError'
import { useAuthContext } from '../../contexts/AuthContext'
import { Button, ButtonLink, Skeleton } from '../../components/ui'
import type { DeckCardResponse, DeckResponse } from '../../types/deck'
import type { ReviewRating } from '../../types/review'
import styles from './FlashcardPage.module.scss'

type Mode = 'normal' | 'reverse' | 'shuffle'

const RATING_OPTIONS: { rating: ReviewRating; label: string; className: string }[] = [
  { rating: 'FORGOT', label: 'Quên rồi', className: styles.forgot },
  { rating: 'HARD', label: 'Khó', className: styles.hard },
  { rating: 'GOOD', label: 'Tốt', className: styles.good },
  { rating: 'EASY', label: 'Dễ', className: styles.easy },
]

function shuffledIndices(length: number): number[] {
  const indices = Array.from({ length }, (_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  return indices
}

function FlashcardPage() {
  const { id } = useParams<{ id: string }>()
  const { isLoading: isAuthLoading } = useAuthContext()

  const [deck, setDeck] = useState<DeckResponse | null>(null)
  const [cards, setCards] = useState<DeckCardResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [mode, setMode] = useState<Mode>('normal')
  const [shuffleSeed, setShuffleSeed] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [ratingCounts, setRatingCounts] = useState<Record<ReviewRating, number>>({
    FORGOT: 0,
    HARD: 0,
    GOOD: 0,
    EASY: 0,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ratingError, setRatingError] = useState<string | null>(null)

  // Đợi AuthContext khôi phục xong access token trước khi gọi API - GET /api/decks/{id}/cards
  // gating theo ownerId cho Deck PRIVATE, cùng quy tắc bắt buộc CODING_CONVENTIONS.md mục 2.2.
  useEffect(() => {
    if (!id || isAuthLoading) return
    let ignore = false

    async function loadDeck() {
      setIsLoading(true)
      setErrorMessage(null)
      try {
        const [deckData, cardsData] = await Promise.all([
          deckService.getDeckById(Number(id)),
          deckService.getDeckCards(Number(id)),
        ])
        if (ignore) return
        setDeck(deckData)
        setCards(cardsData)
      } catch (error) {
        if (!ignore) setErrorMessage(getApiErrorMessage(error))
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadDeck()
    return () => {
      ignore = true
    }
  }, [id, isAuthLoading])

  const order = useMemo(
    () => (mode === 'shuffle' ? shuffledIndices(cards.length) : cards.map((_, i) => i)),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- shuffleSeed cố ý dùng để ép xáo trộn lại khi bấm "Học lại"
    [cards, mode, shuffleSeed],
  )

  // Reset tiến độ ngay trong lúc render khi đổi mode (đúng pattern React khuyến nghị "Adjusting
  // state when a prop changes" - tránh setState trong effect chỉ để đồng bộ state dẫn xuất).
  const [appliedMode, setAppliedMode] = useState(mode)
  if (mode !== appliedMode) {
    setAppliedMode(mode)
    setCurrentIndex(0)
    setIsFlipped(false)
  }

  const isCompleted = cards.length > 0 && currentIndex >= order.length
  const currentCard = !isCompleted && order.length > 0 ? cards[order[currentIndex]] : null
  const frontText = currentCard ? (mode === 'reverse' ? currentCard.meaning : currentCard.word) : ''
  const backText = currentCard ? (mode === 'reverse' ? currentCard.word : currentCard.meaning) : ''

  function handleModeChange(nextMode: Mode) {
    setMode(nextMode)
  }

  function restartSession() {
    setShuffleSeed((s) => s + 1)
    setCurrentIndex(0)
    setIsFlipped(false)
    setRatingCounts({ FORGOT: 0, HARD: 0, GOOD: 0, EASY: 0 })
    setRatingError(null)
  }

  async function handleRate(rating: ReviewRating) {
    if (!currentCard) return
    setIsSubmitting(true)
    setRatingError(null)
    try {
      await reviewService.submitReview(currentCard.vocabularyId, rating)
      setRatingCounts((prev) => ({ ...prev, [rating]: prev[rating] + 1 }))
      setCurrentIndex((i) => i + 1)
      setIsFlipped(false)
    } catch (error) {
      setRatingError(getApiErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className={`container ${styles.page}`}>
        <Skeleton height={16} width={120} style={{ marginBottom: 24 }} />
        <Skeleton height={360} style={{ borderRadius: 24 }} />
      </div>
    )
  }

  if (errorMessage || !deck) {
    return (
      <div className="container">
        <div className={styles.errorState}>
          <span className={styles.errorIcon}>
            <AlertCircle size={26} />
          </span>
          <p>{errorMessage ?? 'Không tìm thấy Deck'}</p>
        </div>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className={`container ${styles.page}`}>
        <div className={styles.errorState}>
          <span className={styles.errorIcon}>
            <AlertCircle size={26} />
          </span>
          <p>Deck này chưa có thẻ nào để học.</p>
          <ButtonLink to={`/decks/${deck.id}`} className={styles.backButton}>
            Quay lại Deck
          </ButtonLink>
        </div>
      </div>
    )
  }

  return (
    <div className={`container ${styles.page}`}>
      <Link to={`/decks/${deck.id}`} className={styles.backLink}>
        Thoát
      </Link>

      <div className={styles.header}>
        <h1 className={styles.title}>{deck.title}</h1>
        <div className={styles.modes}>
          <button
            type="button"
            className={`${styles.modeButton} ${mode === 'normal' ? styles.modeActive : ''}`}
            onClick={() => handleModeChange('normal')}
          >
            Xuôi
          </button>
          <button
            type="button"
            className={`${styles.modeButton} ${mode === 'reverse' ? styles.modeActive : ''}`}
            onClick={() => handleModeChange('reverse')}
          >
            Ngược
          </button>
          <button
            type="button"
            className={`${styles.modeButton} ${mode === 'shuffle' ? styles.modeActive : ''}`}
            onClick={() => handleModeChange('shuffle')}
          >
            <Shuffle size={13} /> Xáo trộn
          </button>
        </div>
      </div>

      {isCompleted ? (
        <div className={styles.completeCard}>
          <span className={styles.completeIcon}>
            <CheckCircle2 size={28} />
          </span>
          <h2 className="h5">Đã học hết {cards.length} thẻ!</h2>
          <div className={styles.summaryRow}>
            {RATING_OPTIONS.map((option) => (
              <span key={option.rating} className={`${styles.summaryPill} ${option.className}`}>
                {option.label}: {ratingCounts[option.rating]}
              </span>
            ))}
          </div>
          <div className={styles.completeActions}>
            <Button onClick={restartSession} leftIcon={<RotateCcw size={16} />}>
              Học lại
            </Button>
            <ButtonLink to={`/decks/${deck.id}`} variant="outline">
              Quay lại Deck
            </ButtonLink>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.progress}>
            {currentIndex + 1}/{order.length}
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
                {currentCard?.imageUrl && mode !== 'reverse' && (
                  <img src={currentCard.imageUrl} alt="" className={styles.cardImage} />
                )}
                <span className={styles.cardText}>{frontText}</span>
                {currentCard?.ipa && mode !== 'reverse' && <span className={styles.cardIpa}>/{currentCard.ipa}/</span>}
                <span className={styles.flipHint}>
                  <Volume2 size={14} /> Bấm để lật thẻ
                </span>
              </div>
              <div className={`${styles.face} ${styles.faceBack}`}>
                <span className={styles.cardText}>{backText}</span>
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
          {!isFlipped && <p className={styles.ratingHint}>Lật thẻ để xem đáp án và đánh giá mức độ nhớ</p>}
          {ratingError && <p className={styles.ratingError}>{ratingError}</p>}
        </>
      )}
    </div>
  )
}

export default FlashcardPage
