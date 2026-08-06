import { Card } from '../ui'
import type { LeaderboardEntry } from '../../mock/dashboardMock'
import styles from './LeaderboardPreview.module.scss'

export interface LeaderboardPreviewProps {
  entries: LeaderboardEntry[]
}

const RANK_CLASS: Record<number, string> = { 1: 'rank1', 2: 'rank2', 3: 'rank3' }

/** Leaderboard thuộc Phase 2 (chưa build ở Backend, xem docs/PROJECT_OVERVIEW.md mục 11) - dùng mock data. */
function LeaderboardPreview({ entries }: LeaderboardPreviewProps) {
  return (
    <Card padding="lg">
      <div className={styles.header}>
        <h2 className="h5" style={{ margin: 0 }}>
          Bảng xếp hạng
        </h2>
        <span className={styles.comingSoon}>Sắp ra mắt</span>
      </div>
      <div className={styles.list}>
        {entries.map((entry) => (
          <div className={styles.item} key={entry.rank}>
            <span className={`${styles.rank} ${styles[RANK_CLASS[entry.rank]] ?? ''}`}>{entry.rank}</span>
            <span className={styles.name}>{entry.displayName}</span>
            <span className={styles.xp}>{entry.xp.toLocaleString('vi-VN')} XP</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default LeaderboardPreview
