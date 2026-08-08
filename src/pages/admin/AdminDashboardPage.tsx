import { useEffect, useState } from 'react'
import { AlertCircle, BookOpen, ClipboardCheck, GraduationCap, Layers, ListChecks, UserCheck, Users } from 'lucide-react'
import adminService from '../../services/adminService'
import { getApiErrorMessage } from '../../api/apiError'
// StatTile vốn thuộc components/dashboard/ (User Dashboard) nhưng đủ tổng quát (icon/value/label)
// để tái dùng cho Admin Dashboard, tránh tạo trùng component.
import StatTile from '../../components/dashboard/StatTile'
import { Skeleton } from '../../components/ui'
import type { AdminDashboardResponse } from '../../types/admin'
import styles from './AdminDashboardPage.module.scss'

function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    async function load() {
      setIsLoading(true)
      setErrorMessage(null)
      try {
        const result = await adminService.getDashboard()
        if (!ignore) setData(result)
      } catch (error) {
        if (!ignore) setErrorMessage(getApiErrorMessage(error))
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    load()
    return () => {
      ignore = true
    }
  }, [])

  return (
    <div className={styles.page}>
      <h1>Tổng quan quản trị</h1>
      <p className={styles.subtitle}>Số liệu tổng quan toàn hệ thống</p>

      {errorMessage ? (
        <div className={styles.errorState}>
          <span className={styles.errorIcon}>
            <AlertCircle size={26} />
          </span>
          <p>{errorMessage}</p>
        </div>
      ) : isLoading || !data ? (
        <div className={styles.grid}>
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} height={92} style={{ borderRadius: 16 }} />
          ))}
        </div>
      ) : (
        <div className={styles.grid}>
          <StatTile
            icon={<Users size={22} />}
            iconBg="var(--dl-primary-50)"
            iconColor="var(--dl-primary-600)"
            value={data.totalUsers.toLocaleString('vi-VN')}
            label="Tổng người dùng"
            to="/admin/users"
          />
          <StatTile
            icon={<UserCheck size={22} />}
            iconBg="var(--dl-success-50)"
            iconColor="var(--dl-success-600)"
            value={data.activeUsers.toLocaleString('vi-VN')}
            label="Đang hoạt động"
            to="/admin/users"
          />
          <StatTile
            icon={<BookOpen size={22} />}
            iconBg="var(--dl-secondary-50)"
            iconColor="var(--dl-secondary-600)"
            value={data.totalCourses.toLocaleString('vi-VN')}
            label="Khoá học"
          />
          <StatTile
            icon={<GraduationCap size={22} />}
            iconBg="var(--dl-accent-50)"
            iconColor="var(--dl-accent-600)"
            value={data.totalLessons.toLocaleString('vi-VN')}
            label="Bài học"
          />
          <StatTile
            icon={<ListChecks size={22} />}
            iconBg="var(--dl-primary-50)"
            iconColor="var(--dl-primary-600)"
            value={data.totalVocabulary.toLocaleString('vi-VN')}
            label="Từ vựng"
          />
          <StatTile
            icon={<Layers size={22} />}
            iconBg="var(--dl-secondary-50)"
            iconColor="var(--dl-secondary-600)"
            value={data.totalDecks.toLocaleString('vi-VN')}
            label="Deck"
          />
          <StatTile
            icon={<ClipboardCheck size={22} />}
            iconBg="var(--dl-info-50)"
            iconColor="var(--dl-info-600)"
            value={data.totalQuizAttempts.toLocaleString('vi-VN')}
            label="Lượt làm Quiz"
          />
        </div>
      )}
    </div>
  )
}

export default AdminDashboardPage
