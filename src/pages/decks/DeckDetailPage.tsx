import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertCircle,
  Copy,
  Globe,
  GraduationCap,
  ImageIcon,
  Layers,
  Lock,
  LogIn,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import deckService from '../../services/deckService'
import { getApiErrorMessage } from '../../api/apiError'
import { useAuthContext } from '../../contexts/AuthContext'
import { Badge, Button, ButtonLink, Card, Input, Select, Skeleton } from '../../components/ui'
import SpreadsheetImportPanel from '../../components/common/SpreadsheetImportPanel'
import type { DeckCardResponse, DeckResponse, DeckStatus, DeckVisibility } from '../../types/deck'
import styles from './DeckDetailPage.module.scss'

interface EditDeckForm {
  title: string
  description: string
  visibility: DeckVisibility
  status: DeckStatus
}

interface AddCardForm {
  word: string
  meaning: string
  ipa: string
  imageUrl: string
}

const EMPTY_ADD_CARD: AddCardForm = { word: '', meaning: '', ipa: '', imageUrl: '' }

function DeckDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isLoading: isAuthLoading } = useAuthContext()

  const [deck, setDeck] = useState<DeckResponse | null>(null)
  const [cards, setCards] = useState<DeckCardResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [showEditForm, setShowEditForm] = useState(false)
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const { register: registerEdit, handleSubmit: handleEditSubmit, reset: resetEditForm } = useForm<EditDeckForm>()

  const [isDeleting, setIsDeleting] = useState(false)
  const [isCloning, setIsCloning] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const [showAddCardForm, setShowAddCardForm] = useState(false)
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [addCardError, setAddCardError] = useState<string | null>(null)
  const [deletingCardId, setDeletingCardId] = useState<number | null>(null)
  const {
    register: registerAddCard,
    handleSubmit: handleAddCardSubmit,
    reset: resetAddCardForm,
  } = useForm<AddCardForm>({ defaultValues: EMPTY_ADD_CARD })

  // Đợi AuthContext khôi phục xong access token trước khi gọi API - Deck PRIVATE của chính chủ
  // chỉ hiển thị đúng cho owner (gating ownerId === currentUserId), cùng quy tắc bắt buộc đã áp
  // dụng cho Lesson/Course/Vocabulary Learning (CODING_CONVENTIONS.md mục 2.2).
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

  const isOwner = !!user && !!deck && user.id === deck.ownerId

  function openEditForm() {
    if (!deck) return
    resetEditForm({
      title: deck.title,
      description: deck.description ?? '',
      visibility: deck.visibility,
      status: deck.status,
    })
    setShowEditForm(true)
  }

  async function onEditSubmit(data: EditDeckForm) {
    if (!deck) return
    setIsSavingEdit(true)
    setEditError(null)
    try {
      const updated = await deckService.updateDeck(deck.id, {
        title: data.title,
        description: data.description || undefined,
        visibility: data.visibility,
        status: data.status,
      })
      setDeck(updated)
      setShowEditForm(false)
    } catch (error) {
      setEditError(getApiErrorMessage(error))
    } finally {
      setIsSavingEdit(false)
    }
  }

  async function handleDelete() {
    if (!deck) return
    if (!window.confirm('Xoá Deck này? Hành động không thể hoàn tác.')) return
    setIsDeleting(true)
    setActionError(null)
    try {
      await deckService.deleteDeck(deck.id)
      navigate('/decks')
    } catch (error) {
      setActionError(getApiErrorMessage(error))
      setIsDeleting(false)
    }
  }

  async function handleClone() {
    if (!deck) return
    if (!user) {
      navigate('/login')
      return
    }
    setIsCloning(true)
    setActionError(null)
    try {
      const cloned = await deckService.cloneDeck(deck.id)
      navigate(`/decks/${cloned.id}`)
    } catch (error) {
      setActionError(getApiErrorMessage(error))
      setIsCloning(false)
    }
  }

  async function onAddCardSubmit(data: AddCardForm) {
    if (!deck) return
    setIsAddingCard(true)
    setAddCardError(null)
    try {
      const card = await deckService.addCard(deck.id, {
        word: data.word,
        meaning: data.meaning,
        ipa: data.ipa || undefined,
        imageUrl: data.imageUrl || undefined,
      })
      setCards((prev) => [...prev, card])
      setDeck((prev) => (prev ? { ...prev, cardCount: prev.cardCount + 1 } : prev))
      resetAddCardForm(EMPTY_ADD_CARD)
      setShowAddCardForm(false)
    } catch (error) {
      setAddCardError(getApiErrorMessage(error))
    } finally {
      setIsAddingCard(false)
    }
  }

  async function handleImportSuccess() {
    if (!deck) return
    try {
      const [cardsData, deckData] = await Promise.all([deckService.getDeckCards(deck.id), deckService.getDeckById(deck.id)])
      setCards(cardsData)
      setDeck(deckData)
    } catch (error) {
      setActionError(getApiErrorMessage(error))
    }
  }

  async function handleDeleteCard(cardId: number) {
    if (!deck) return
    setDeletingCardId(cardId)
    setActionError(null)
    try {
      await deckService.deleteCard(deck.id, cardId)
      setCards((prev) => prev.filter((c) => c.id !== cardId))
      setDeck((prev) => (prev ? { ...prev, cardCount: prev.cardCount - 1 } : prev))
    } catch (error) {
      setActionError(getApiErrorMessage(error))
    } finally {
      setDeletingCardId(null)
    }
  }

  if (isLoading) {
    return (
      <div className={`container ${styles.page}`}>
        <Skeleton height={16} width={120} style={{ marginBottom: 24 }} />
        <Skeleton height={32} width="50%" style={{ marginBottom: 12 }} />
        <Skeleton height={16} style={{ marginBottom: 32 }} />
        <Skeleton height={120} style={{ marginBottom: 16 }} />
        <Skeleton height={120} />
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

  return (
    <div className={`container ${styles.page}`}>
      <Link to="/decks" className={styles.backLink}>
        Quay lại Deck
      </Link>

      <div className={styles.header}>
        <div className={styles.headerMain}>
          <h1 className={styles.title}>{deck.title}</h1>
          <div className={styles.badges}>
            <Badge variant="secondary" icon={<Globe size={11} />}>
              {deck.languageCode.toUpperCase()}
            </Badge>
            {deck.visibility === 'PRIVATE' && (
              <Badge variant="neutral" icon={<Lock size={11} />}>
                Riêng tư
              </Badge>
            )}
            {deck.status === 'ARCHIVED' && <Badge variant="neutral">Đã lưu trữ</Badge>}
          </div>
          {deck.description && <p className={styles.description}>{deck.description}</p>}
          <div className={styles.meta}>
            <Layers size={14} />
            {deck.cardCount} thẻ
          </div>
        </div>

        <div className={styles.actions}>
          {deck.cardCount === 0 ? (
            <Button disabled leftIcon={<GraduationCap size={16} />} title="Deck chưa có thẻ nào">
              Học Flashcard
            </Button>
          ) : (
            <ButtonLink to={`/decks/${deck.id}/flashcard`} leftIcon={<GraduationCap size={16} />}>
              Học Flashcard
            </ButtonLink>
          )}
          {isOwner ? (
            <>
              <Button variant="outline" onClick={openEditForm} leftIcon={<Pencil size={16} />}>
                Sửa Deck
              </Button>
              <Button variant="danger" onClick={handleDelete} isLoading={isDeleting} leftIcon={<Trash2 size={16} />}>
                Xoá Deck
              </Button>
            </>
          ) : deck.visibility === 'PUBLIC' ? (
            <Button variant="outline" onClick={handleClone} isLoading={isCloning} leftIcon={<Copy size={16} />}>
              {user ? 'Nhân bản Deck' : 'Đăng nhập để nhân bản'}
            </Button>
          ) : null}
        </div>
      </div>

      {actionError && <p className={styles.actionError}>{actionError}</p>}

      {showEditForm && isOwner && (
        <form className={styles.editForm} onSubmit={handleEditSubmit(onEditSubmit)}>
          <Input label="Tên Deck" {...registerEdit('title', { required: true })} />
          <Select label="Chế độ hiển thị" {...registerEdit('visibility')}>
            <option value="PRIVATE">Riêng tư</option>
            <option value="PUBLIC">Công khai</option>
          </Select>
          <Select label="Trạng thái" {...registerEdit('status')}>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="ARCHIVED">Đã lưu trữ</option>
          </Select>
          <Input label="Mô tả" {...registerEdit('description')} />
          <div className={styles.editFormActions}>
            <Button type="submit" isLoading={isSavingEdit}>
              Lưu thay đổi
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowEditForm(false)}>
              Huỷ
            </Button>
          </div>
          {editError && <p className={styles.actionError}>{editError}</p>}
        </form>
      )}

      <div className={styles.cardsSection}>
        <div className={styles.sectionTitle}>
          <h2 className="h5" style={{ margin: 0 }}>
            Danh sách thẻ
          </h2>
          {isOwner && (
            <div className={styles.cardsSectionActions}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddCardForm((v) => !v)}
                leftIcon={showAddCardForm ? <X size={14} /> : <Plus size={14} />}
              >
                {showAddCardForm ? 'Đóng' : 'Thêm từ'}
              </Button>
              <SpreadsheetImportPanel
                onImportCsv={(file) => deckService.importCardsCsv(deck.id, file)}
                onImportExcel={(file) => deckService.importCardsExcel(deck.id, file)}
                onDownloadCsvTemplate={deckService.downloadCardCsvTemplate}
                onDownloadExcelTemplate={deckService.downloadCardExcelTemplate}
                onImportSuccess={handleImportSuccess}
              />
            </div>
          )}
        </div>

        {showAddCardForm && isOwner && (
          <form className={styles.addCardForm} onSubmit={handleAddCardSubmit(onAddCardSubmit)}>
            <Input placeholder="Từ (vd: apple)" {...registerAddCard('word', { required: true })} />
            <Input placeholder="Nghĩa (vd: quả táo)" {...registerAddCard('meaning', { required: true })} />
            <Input placeholder="IPA (tuỳ chọn)" {...registerAddCard('ipa')} />
            <Input placeholder="URL ảnh (tuỳ chọn)" {...registerAddCard('imageUrl')} />
            <Button type="submit" isLoading={isAddingCard} className={styles.addCardSubmit}>
              Thêm vào Deck
            </Button>
            {addCardError && <p className={styles.actionError}>{addCardError}</p>}
          </form>
        )}

        {cards.length === 0 ? (
          <Card>
            <p className={styles.emptyCards}>
              {isOwner ? 'Deck này chưa có thẻ nào. Bấm "Thêm từ" để bắt đầu.' : 'Deck này chưa có thẻ nào.'}
            </p>
          </Card>
        ) : (
          <div className={styles.cardList}>
            {cards.map((card) => (
              <Card key={card.id} padding="md" className={styles.cardRow}>
                {card.imageUrl ? (
                  <img src={card.imageUrl} alt="" className={styles.cardImage} />
                ) : (
                  <span className={styles.cardImageFallback}>
                    <ImageIcon size={20} />
                  </span>
                )}
                <div className={styles.cardBody}>
                  <div className={styles.cardWordRow}>
                    <span className={styles.cardWord}>{card.word}</span>
                    {card.ipa && <span className={styles.cardIpa}>/{card.ipa}/</span>}
                  </div>
                  <div className={styles.cardMeaning}>{card.meaning}</div>
                </div>
                {isOwner && (
                  <button
                    type="button"
                    className={styles.cardDeleteButton}
                    onClick={() => handleDeleteCard(card.id)}
                    disabled={deletingCardId === card.id}
                    aria-label={`Xoá thẻ ${card.word}`}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {!user && (
        <div className={styles.loginBanner}>
          <LogIn size={16} />
          <span>
            <Link to="/login">Đăng nhập</Link> để tạo Deck của riêng bạn hoặc nhân bản Deck này.
          </span>
        </div>
      )}
    </div>
  )
}

export default DeckDetailPage
