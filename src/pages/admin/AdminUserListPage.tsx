import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  AlertCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Flame,
  Lock,
  Search,
  ShieldCheck,
  Trophy,
  UserX,
} from 'lucide-react'
import adminService from '../../services/adminService'
import { getApiErrorMessage } from '../../api/apiError'
import { useAuthContext } from '../../contexts/AuthContext'
import { Badge, Button, Input, Pagination, Skeleton } from '../../components/ui'
import type { BadgeVariant } from '../../components/ui'
import type { AdminUserProgressResponse } from '../../types/admin'
import type { UserResponse, UserStatus } from '../../types/user'
import styles from './AdminUserListPage.module.scss'

const PAGE_SIZE = 20

const STATUS_LABEL: Record<UserStatus, { label: string; variant: BadgeVariant }> = {
  ACTIVE: { label: 'Hoạt động', variant: 'success' },
  DISABLED: { label: 'Đã vô hiệu hoá', variant: 'danger' },
  LOCKED: { label: 'Đã khoá', variant: 'danger' },
  PENDING_VERIFICATION: { label: 'Chưa xác thực', variant: 'neutral' },
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('vi-VN')
}

function AdminUserListPage() {
  const { user: currentUser } = useAuthContext()

  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [users, setUsers] = useState<UserResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [progressCache, setProgressCache] = useState<Map<number, AdminUserProgressResponse>>(new Map())
  const [isLoadingProgress, setIsLoadingProgress] = useState(false)
  const [progressError, setProgressError] = useState<string | null>(null)

  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const { register, handleSubmit } = useForm<{ keyword: string }>({ defaultValues: { keyword: '' } })

  useEffect(() => {
    let ignore = false

    async function loadUsers() {
      setIsLoading(true)
      setErrorMessage(null)
      try {
        const data = await adminService.getUsers({ keyword: keyword || undefined, page, size: PAGE_SIZE })
        if (ignore) return
        setUsers(data.content)
        setTotalPages(data.totalPages)
      } catch (error) {
        if (!ignore) setErrorMessage(getApiErrorMessage(error))
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadUsers()
    return () => {
      ignore = true
    }
  }, [keyword, page])

  function onSearchSubmit(data: { keyword: string }) {
    setPage(0)
    setKeyword(data.keyword)
  }

  async function handleToggleExpand(userId: number) {
    if (expandedId === userId) {
      setExpandedId(null)
      return
    }
    setExpandedId(userId)
    if (progressCache.has(userId)) return
    setIsLoadingProgress(true)
    setProgressError(null)
    try {
      const progress = await adminService.getUserProgress(userId)
      setProgressCache((prev) => new Map(prev).set(userId, progress))
    } catch (error) {
      setProgressError(getApiErrorMessage(error))
    } finally {
      setIsLoadingProgress(false)
    }
  }

  function replaceUser(updated: UserResponse) {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
  }

  async function handleActivate(userId: number) {
    setActionLoadingId(userId)
    setActionError(null)
    try {
      const updated = await adminService.activateUser(userId)
      replaceUser(updated)
    } catch (error) {
      setActionError(getApiErrorMessage(error))
    } finally {
      setActionLoadingId(null)
    }
  }

  async function handleDisable(userId: number) {
    if (!window.confirm('Vô hiệu hoá tài khoản này? User sẽ bị đăng xuất ngay lập tức.')) return
    setActionLoadingId(userId)
    setActionError(null)
    try {
      const updated = await adminService.disableUser(userId)
      replaceUser(updated)
    } catch (error) {
      setActionError(getApiErrorMessage(error))
    } finally {
      setActionLoadingId(null)
    }
  }

  async function handleLock(userId: number) {
    if (!window.confirm('Khoá tài khoản này? User sẽ bị đăng xuất ngay lập tức.')) return
    setActionLoadingId(userId)
    setActionError(null)
    try {
      const updated = await adminService.lockUser(userId)
      replaceUser(updated)
    } catch (error) {
      setActionError(getApiErrorMessage(error))
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className={styles.page}>
      <h1>Quản lý người dùng</h1>
      <p className={styles.subtitle}>Tìm kiếm, xem tiến độ và quản lý trạng thái tài khoản</p>

      <form className={styles.searchForm} onSubmit={handleSubmit(onSearchSubmit)}>
        <Input placeholder="Tìm theo username hoặc email..." leftIcon={<Search size={17} />} {...register('keyword')} />
        <Button type="submit">Tìm</Button>
      </form>

      {actionError && <p className={styles.actionError}>{actionError}</p>}

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
          <Skeleton height={64} style={{ marginBottom: 12 }} />
          <Skeleton height={64} />
        </>
      ) : users.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>
            <Search size={26} />
          </span>
          <p>Không tìm thấy người dùng nào phù hợp.</p>
        </div>
      ) : (
        <>
          <div className={styles.list}>
            {users.map((user) => {
              const isExpanded = expandedId === user.id
              const isSelf = user.id === currentUser?.id
              const status = STATUS_LABEL[user.status]
              const progress = progressCache.get(user.id)
              const isActionLoading = actionLoadingId === user.id

              return (
                <div key={user.id} className={styles.item}>
                  <button type="button" className={styles.itemHeader} onClick={() => handleToggleExpand(user.id)}>
                    <div className={styles.itemMain}>
                      <span className={styles.itemName}>{user.displayName || user.username}</span>
                      <span className={styles.itemMeta}>
                        {user.username} · {user.email}
                      </span>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                    <span className={styles.itemXp}>{user.xp.toLocaleString('vi-VN')} XP</span>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>

                  <div className={styles.itemActions}>
                    {isSelf ? (
                      <span className={styles.selfNote}>Không thể tự thay đổi trạng thái tài khoản của chính mình</span>
                    ) : (
                      <>
                        {(user.status === 'DISABLED' || user.status === 'LOCKED') && (
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<ShieldCheck size={14} />}
                            isLoading={isActionLoading}
                            onClick={() => handleActivate(user.id)}
                          >
                            Kích hoạt lại
                          </Button>
                        )}
                        {user.status === 'ACTIVE' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              leftIcon={<UserX size={14} />}
                              isLoading={isActionLoading}
                              onClick={() => handleDisable(user.id)}
                            >
                              Vô hiệu hoá
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              leftIcon={<Lock size={14} />}
                              isLoading={isActionLoading}
                              onClick={() => handleLock(user.id)}
                            >
                              Khoá
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  {isExpanded && (
                    <div className={styles.itemDetail}>
                      {isLoadingProgress && !progress ? (
                        <Skeleton height={60} />
                      ) : progressError && !progress ? (
                        <p className={styles.progressError}>{progressError}</p>
                      ) : progress ? (
                        <>
                          <div className={styles.progressStats}>
                            <span className={styles.progressStat}>
                              <Trophy size={13} /> {progress.xp.toLocaleString('vi-VN')} XP
                            </span>
                            <span className={styles.progressStat}>
                              <Flame size={13} /> Streak hiện tại: {progress.currentStreak} ngày
                            </span>
                            <span className={styles.progressStat}>Streak dài nhất: {progress.longestStreak} ngày</span>
                          </div>
                          {progress.courseEnrollments.length === 0 ? (
                            <p className={styles.noEnrollment}>Chưa ghi danh khoá học nào.</p>
                          ) : (
                            <div className={styles.enrollmentList}>
                              {progress.courseEnrollments.map((enrollment) => (
                                <div key={enrollment.id} className={styles.enrollmentRow}>
                                  <BookOpen size={14} />
                                  <span className={styles.enrollmentTitle}>{enrollment.courseTitle}</span>
                                  <Badge variant={enrollment.status === 'COMPLETED' ? 'success' : 'primary'}>
                                    {enrollment.status === 'COMPLETED' ? 'Hoàn thành' : 'Đang học'}
                                  </Badge>
                                  <span className={styles.enrollmentPercent}>{enrollment.progressPercent}%</span>
                                  <span className={styles.enrollmentDate}>{formatDate(enrollment.enrolledAt)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : null}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}

export default AdminUserListPage
