import { Flame, Lock, Star, Trophy, Zap } from 'lucide-react'
import { Card } from '../ui'
import type { AchievementPreview as AchievementPreviewItem } from '../../mock/dashboardMock'
import styles from './AchievementsPreview.module.scss'

export interface AchievementsPreviewProps {
  achievements: AchievementPreviewItem[]
}

const ICON = { flame: Flame, trophy: Trophy, star: Star, zap: Zap } as const

/** Achievement thuộc Phase 2 (chưa build ở Backend, xem docs/PROJECT_OVERVIEW.md mục 11) - dùng mock data. */
function AchievementsPreview({ achievements }: AchievementsPreviewProps) {
  return (
    <Card padding="lg">
      <div className={styles.header}>
        <h2 className="h5" style={{ margin: 0 }}>
          Thành tích
        </h2>
        <span className={styles.comingSoon}>Sắp ra mắt</span>
      </div>
      <div className={styles.grid}>
        {achievements.map((achievement) => {
          const Icon = ICON[achievement.icon]
          return (
            <div className={styles.badge} key={achievement.id}>
              <span className={`${styles.icon} ${achievement.unlocked ? '' : styles.locked}`}>
                {achievement.unlocked ? <Icon size={22} /> : <Lock size={18} />}
              </span>
              <span className={styles.title}>{achievement.title}</span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export default AchievementsPreview
