import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { AlertCircle, Globe, Pencil, Plus, Trash2, X } from 'lucide-react'
import languageService from '../../services/languageService'
import { getApiErrorMessage } from '../../api/apiError'
import { Badge, Button, Card, Input, Select, Skeleton } from '../../components/ui'
import type { LanguageResponse, LanguageStatus } from '../../types/language'
import styles from './AdminLanguageListPage.module.scss'

interface CreateForm {
  code: string
  name: string
  flagIconUrl: string
}

interface EditForm {
  name: string
  flagIconUrl: string
  status: LanguageStatus
}

const EMPTY_CREATE: CreateForm = { code: '', name: '', flagIconUrl: '' }

function AdminLanguageListPage() {
  const [languages, setLanguages] = useState<LanguageResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const { register: registerCreate, handleSubmit: handleCreateSubmit, reset: resetCreateForm } = useForm<CreateForm>({
    defaultValues: EMPTY_CREATE,
  })

  const [editingId, setEditingId] = useState<number | null>(null)
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const { register: registerEdit, handleSubmit: handleEditSubmit, reset: resetEditForm } = useForm<EditForm>()

  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    async function loadLanguages() {
      setIsLoading(true)
      setErrorMessage(null)
      try {
        const data = await languageService.getAllLanguagesForAdmin()
        setLanguages(data)
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error))
      } finally {
        setIsLoading(false)
      }
    }

    loadLanguages()
  }, [])

  async function onCreateSubmit(data: CreateForm) {
    setIsCreating(true)
    setCreateError(null)
    try {
      const created = await languageService.createLanguage({
        code: data.code,
        name: data.name,
        flagIconUrl: data.flagIconUrl || undefined,
      })
      setLanguages((prev) => [...prev, created])
      resetCreateForm(EMPTY_CREATE)
      setShowCreateForm(false)
    } catch (error) {
      setCreateError(getApiErrorMessage(error))
    } finally {
      setIsCreating(false)
    }
  }

  function openEdit(language: LanguageResponse) {
    resetEditForm({ name: language.name, flagIconUrl: language.flagIconUrl ?? '', status: language.status })
    setEditingId(language.id)
    setEditError(null)
  }

  async function onEditSubmit(data: EditForm) {
    if (editingId == null) return
    setIsSavingEdit(true)
    setEditError(null)
    try {
      const updated = await languageService.updateLanguage(editingId, {
        name: data.name,
        flagIconUrl: data.flagIconUrl || undefined,
        status: data.status,
      })
      setLanguages((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))
      setEditingId(null)
    } catch (error) {
      setEditError(getApiErrorMessage(error))
    } finally {
      setIsSavingEdit(false)
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Xoá ngôn ngữ này? Các Khoá học/Từ vựng đang dùng ngôn ngữ này có thể bị ảnh hưởng.')) return
    setDeletingId(id)
    setActionError(null)
    try {
      await languageService.deleteLanguage(id)
      setLanguages((prev) => prev.filter((l) => l.id !== id))
    } catch (error) {
      setActionError(getApiErrorMessage(error))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Ngôn ngữ</h1>
          <p className={styles.subtitle}>Quản lý danh sách ngôn ngữ hệ thống hỗ trợ</p>
        </div>
        <Button onClick={() => setShowCreateForm((v) => !v)} leftIcon={showCreateForm ? <X size={16} /> : <Plus size={16} />}>
          {showCreateForm ? 'Đóng' : 'Tạo ngôn ngữ mới'}
        </Button>
      </div>

      {showCreateForm && (
        <form className={styles.form} onSubmit={handleCreateSubmit(onCreateSubmit)}>
          <Input label="Mã ngôn ngữ (vd: en, ja)" {...registerCreate('code', { required: true })} />
          <Input label="Tên hiển thị" {...registerCreate('name', { required: true })} />
          <Input label="URL ảnh cờ (tuỳ chọn)" {...registerCreate('flagIconUrl')} />
          <Button type="submit" isLoading={isCreating} className={styles.formSubmit}>
            Tạo
          </Button>
          {createError && <p className={styles.errorText}>{createError}</p>}
        </form>
      )}

      {actionError && <p className={styles.errorText}>{actionError}</p>}

      {errorMessage ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>
            <AlertCircle size={26} />
          </span>
          <p>{errorMessage}</p>
        </div>
      ) : isLoading ? (
        <>
          <Skeleton height={64} style={{ marginBottom: 12 }} />
          <Skeleton height={64} />
        </>
      ) : languages.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>
            <Globe size={26} />
          </span>
          <p>Chưa có ngôn ngữ nào.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {languages.map((language) => (
            <Card key={language.id} padding="md" className={styles.item}>
              <div className={styles.itemRow}>
                <div className={styles.itemMain}>
                  <span className={styles.itemName}>{language.name}</span>
                  <span className={styles.itemCode}>{language.code}</span>
                  <Badge variant={language.status === 'ACTIVE' ? 'success' : 'neutral'}>
                    {language.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng hoạt động'}
                  </Badge>
                </div>
                <div className={styles.itemActions}>
                  <Button size="sm" variant="outline" leftIcon={<Pencil size={14} />} onClick={() => openEdit(language)}>
                    Sửa
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Trash2 size={14} />}
                    isLoading={deletingId === language.id}
                    onClick={() => handleDelete(language.id)}
                  >
                    Xoá
                  </Button>
                </div>
              </div>

              {editingId === language.id && (
                <form className={styles.editForm} onSubmit={handleEditSubmit(onEditSubmit)}>
                  <Input label="Tên hiển thị" {...registerEdit('name', { required: true })} />
                  <Input label="URL ảnh cờ" {...registerEdit('flagIconUrl')} />
                  <Select label="Trạng thái" {...registerEdit('status')}>
                    <option value="ACTIVE">Hoạt động</option>
                    <option value="INACTIVE">Ngừng hoạt động</option>
                  </Select>
                  <div className={styles.editFormActions}>
                    <Button type="submit" size="sm" isLoading={isSavingEdit}>
                      Lưu
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      Huỷ
                    </Button>
                  </div>
                  {editError && <p className={styles.errorText}>{editError}</p>}
                </form>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminLanguageListPage
