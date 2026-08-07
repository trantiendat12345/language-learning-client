import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Layers, LogIn, Plus, Search, SearchX, X } from 'lucide-react'
import deckService from '../../services/deckService'
import languageService from '../../services/languageService'
import { getApiErrorMessage } from '../../api/apiError'
import { useAuthContext } from '../../contexts/AuthContext'
import { Button, Input, Pagination, Select } from '../../components/ui'
import DeckCard from '../../components/decks/DeckCard'
import DeckCardSkeleton from '../../components/decks/DeckCardSkeleton'
import type { DeckSummaryResponse, DeckVisibility } from '../../types/deck'
import type { LanguageResponse } from '../../types/language'
import styles from './DeckListPage.module.scss'

type Tab = 'explore' | 'mine'
const PAGE_SIZE = 12

interface CreateDeckForm {
  title: string
  languageId: string
  description: string
  visibility: DeckVisibility
}

const EMPTY_CREATE_FORM: CreateDeckForm = { title: '', languageId: '', description: '', visibility: 'PRIVATE' }

function DeckListPage() {
  const navigate = useNavigate()
  const { user, isLoading: isAuthLoading } = useAuthContext()

  const [tab, setTab] = useState<Tab>('explore')
  const [languages, setLanguages] = useState<LanguageResponse[]>([])

  const [keyword, setKeyword] = useState('')
  const [explorePage, setExplorePage] = useState(0)
  const [exploreDecks, setExploreDecks] = useState<DeckSummaryResponse[]>([])
  const [exploreTotalPages, setExploreTotalPages] = useState(0)
  const [isExploreLoading, setIsExploreLoading] = useState(true)
  const [exploreError, setExploreError] = useState<string | null>(null)

  const [minePage, setMinePage] = useState(0)
  const [myDecks, setMyDecks] = useState<DeckSummaryResponse[]>([])
  const [mineTotalPages, setMineTotalPages] = useState(0)
  const [isMineLoading, setIsMineLoading] = useState(true)
  const [mineError, setMineError] = useState<string | null>(null)

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const { register: registerKeyword, handleSubmit: handleKeywordSubmit } = useForm<{ keyword: string }>({
    defaultValues: { keyword: '' },
  })
  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreateForm,
  } = useForm<CreateDeckForm>({ defaultValues: EMPTY_CREATE_FORM })

  useEffect(() => {
    languageService.getActiveLanguages().then(setLanguages)
  }, [])

  useEffect(() => {
    let ignore = false

    async function loadExplore() {
      setIsExploreLoading(true)
      setExploreError(null)
      try {
        const data = await deckService.getPublicDecks({ keyword: keyword || undefined, page: explorePage, size: PAGE_SIZE })
        if (ignore) return
        setExploreDecks(data.content)
        setExploreTotalPages(data.totalPages)
      } catch (error) {
        if (!ignore) setExploreError(getApiErrorMessage(error))
      } finally {
        if (!ignore) setIsExploreLoading(false)
      }
    }

    loadExplore()
    return () => {
      ignore = true
    }
  }, [keyword, explorePage])

  // Đợi AuthContext khôi phục xong access token trước khi gọi /api/decks/mine - trang public
  // nhưng tab "Deck của tôi" phụ thuộc currentUserId (quy tắc bắt buộc CODING_CONVENTIONS.md mục 2.2).
  useEffect(() => {
    if (isAuthLoading) return
    let ignore = false

    async function loadMine() {
      if (!user) {
        setMyDecks([])
        setMineTotalPages(0)
        setIsMineLoading(false)
        return
      }
      setIsMineLoading(true)
      setMineError(null)
      try {
        const data = await deckService.getMyDecks({ page: minePage, size: PAGE_SIZE })
        if (ignore) return
        setMyDecks(data.content)
        setMineTotalPages(data.totalPages)
      } catch (error) {
        if (!ignore) setMineError(getApiErrorMessage(error))
      } finally {
        if (!ignore) setIsMineLoading(false)
      }
    }

    loadMine()
    return () => {
      ignore = true
    }
  }, [user, isAuthLoading, minePage])

  function onSearchSubmit(data: { keyword: string }) {
    setExplorePage(0)
    setKeyword(data.keyword)
  }

  async function onCreateSubmit(data: CreateDeckForm) {
    setIsCreating(true)
    setCreateError(null)
    try {
      const created = await deckService.createDeck({
        title: data.title,
        languageId: Number(data.languageId),
        description: data.description || undefined,
        visibility: data.visibility,
      })
      resetCreateForm(EMPTY_CREATE_FORM)
      setShowCreateForm(false)
      navigate(`/decks/${created.id}`)
    } catch (error) {
      setCreateError(getApiErrorMessage(error))
    } finally {
      setIsCreating(false)
    }
  }

  function handleCreateClick() {
    if (!user) {
      navigate('/login')
      return
    }
    setShowCreateForm((v) => !v)
  }

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.header}>
        <div>
          <h1>Deck từ vựng</h1>
          <p className={styles.subtitle}>Tự tạo bộ thẻ từ vựng và học bằng Flashcard theo cách của riêng bạn</p>
        </div>
        <Button onClick={handleCreateClick} leftIcon={showCreateForm ? <X size={16} /> : <Plus size={16} />}>
          {showCreateForm ? 'Đóng' : 'Tạo Deck mới'}
        </Button>
      </div>

      {showCreateForm && (
        <form className={styles.createForm} onSubmit={handleCreateSubmit(onCreateSubmit)}>
          <Input label="Tên Deck" placeholder="VD: Từ vựng TOEIC part 1" {...registerCreate('title', { required: true })} />
          <Select label="Ngôn ngữ" {...registerCreate('languageId', { required: true })}>
            <option value="">Chọn ngôn ngữ</option>
            {languages.map((language) => (
              <option key={language.id} value={language.id}>
                {language.name}
              </option>
            ))}
          </Select>
          <Select label="Chế độ hiển thị" {...registerCreate('visibility')}>
            <option value="PRIVATE">Riêng tư (chỉ mình tôi)</option>
            <option value="PUBLIC">Công khai (mọi người xem được)</option>
          </Select>
          <Input label="Mô tả (tuỳ chọn)" placeholder="Mô tả ngắn về Deck..." {...registerCreate('description')} />
          <Button type="submit" isLoading={isCreating} className={styles.createSubmit}>
            Tạo Deck
          </Button>
          {createError && <p className={styles.createError}>{createError}</p>}
        </form>
      )}

      <div className={styles.tabs}>
        <button type="button" className={`${styles.tab} ${tab === 'explore' ? styles.tabActive : ''}`} onClick={() => setTab('explore')}>
          Khám phá
        </button>
        <button type="button" className={`${styles.tab} ${tab === 'mine' ? styles.tabActive : ''}`} onClick={() => setTab('mine')}>
          Deck của tôi
        </button>
      </div>

      {tab === 'explore' ? (
        <>
          <form className={styles.searchForm} onSubmit={handleKeywordSubmit(onSearchSubmit)}>
            <Input placeholder="Tìm Deck theo tên..." leftIcon={<Search size={17} />} {...registerKeyword('keyword')} />
            <Button type="submit">Tìm</Button>
          </form>

          {exploreError ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>
                <AlertCircle size={26} />
              </span>
              <p>{exploreError}</p>
            </div>
          ) : isExploreLoading ? (
            <div className={styles.grid}>
              {Array.from({ length: 6 }).map((_, index) => (
                <DeckCardSkeleton key={index} />
              ))}
            </div>
          ) : exploreDecks.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>
                <SearchX size={26} />
              </span>
              <p>Không tìm thấy Deck công khai nào phù hợp.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {exploreDecks.map((deck) => (
                <DeckCard deck={deck} key={deck.id} />
              ))}
            </div>
          )}
          <Pagination page={explorePage} totalPages={exploreTotalPages} onPageChange={setExplorePage} />
        </>
      ) : !user ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>
            <Layers size={26} />
          </span>
          <p>Đăng nhập để xem và quản lý Deck của riêng bạn.</p>
          <Button onClick={() => navigate('/login')} leftIcon={<LogIn size={16} />} className={styles.emptyAction}>
            Đăng nhập
          </Button>
        </div>
      ) : mineError ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>
            <AlertCircle size={26} />
          </span>
          <p>{mineError}</p>
        </div>
      ) : isMineLoading ? (
        <div className={styles.grid}>
          {Array.from({ length: 3 }).map((_, index) => (
            <DeckCardSkeleton key={index} />
          ))}
        </div>
      ) : myDecks.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>
            <Layers size={26} />
          </span>
          <p>Bạn chưa có Deck nào. Tạo Deck đầu tiên để bắt đầu học Flashcard!</p>
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            {myDecks.map((deck) => (
              <DeckCard deck={deck} key={deck.id} />
            ))}
          </div>
          <Pagination page={minePage} totalPages={mineTotalPages} onPageChange={setMinePage} />
        </>
      )}
    </div>
  )
}

export default DeckListPage
