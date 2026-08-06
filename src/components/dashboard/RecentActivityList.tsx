import { Eye, GraduationCap, History, RotateCcw } from 'lucide-react'
import { Card, Spinner } from '../ui'
import type { ActivityHistoryResponse } from '../../types/history'
import styles from './RecentActivityList.module.scss'

export interface RecentActivityListProps {
  activities: ActivityHistoryResponse[]
  isLoading: boolean
}

const ACTION_ICON = {
  VIEWED: Eye,
  LEARNED: GraduationCap,
  REVIEWED: RotateCcw,
} as const

const ACTION_TEXT = {
  VIEWED: 'Đã xem',
  LEARNED: 'Đã học xong',
  REVIEWED: 'Đã ôn tập',
} as const

function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  return `${days} ngày trước`
}

function RecentActivityList({ activities, isLoading }: RecentActivityListProps) {
  return (
    <Card padding="lg">
      <div className={styles.header}>
        <h2 className="h5" style={{ margin: 0 }}>
          Hoạt động gần đây
        </h2>
      </div>

      {isLoading ? (
        <Spinner centered />
      ) : activities.length === 0 ? (
        <div className={styles.empty}>
          <History size={24} style={{ marginBottom: 8 }} />
          <div>Chưa có hoạt động nào gần đây</div>
        </div>
      ) : (
        <div className={styles.list}>
          {activities.map((activity) => {
            const Icon = ACTION_ICON[activity.action]
            return (
              <div className={styles.item} key={activity.id}>
                <span className={styles.icon} aria-hidden="true">
                  <Icon size={17} />
                </span>
                <div className={styles.body}>
                  <div className={styles.text}>
                    {ACTION_TEXT[activity.action]} {activity.title ?? 'nội dung đã bị xoá'}
                  </div>
                  <div className={styles.time}>{formatRelativeTime(activity.occurredAt)}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

export default RecentActivityList
