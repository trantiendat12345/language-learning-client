import { CheckCircle2, Target } from 'lucide-react'
import { Card, ProgressRing, ButtonLink } from '../ui'
import type { DailyGoalType } from '../../types/progress'
import styles from './TodayGoalCard.module.scss'

export interface TodayGoalCardProps {
  dailyGoalType: DailyGoalType
  dailyGoalValue: number
  todayStudyMinutes: number
  todayWordsLearned: number
  goalMet: boolean
}

function TodayGoalCard({ dailyGoalType, dailyGoalValue, todayStudyMinutes, todayWordsLearned, goalMet }: TodayGoalCardProps) {
  const current = dailyGoalType === 'TIME' ? todayStudyMinutes : todayWordsLearned
  const unit = dailyGoalType === 'TIME' ? 'phút' : 'từ'
  const percent = dailyGoalValue > 0 ? (current / dailyGoalValue) * 100 : 0

  return (
    <Card padding="lg" className={styles.card}>
      <ProgressRing percent={percent} size={112} strokeWidth={11} color="var(--dl-primary-500)">
        <div className={styles.ringContent}>
          <span className={styles.ringValue}>
            {current}/{dailyGoalValue}
          </span>
          <span className={styles.ringLabel}>{unit}</span>
        </div>
      </ProgressRing>

      <div className={styles.body}>
        <div className={styles.title}>
          <h2 className="h5" style={{ margin: 0 }}>
            Mục tiêu hôm nay
          </h2>
          {goalMet && (
            <span className={styles.badge}>
              <CheckCircle2 size={13} />
              Đã đạt
            </span>
          )}
        </div>
        <p className={styles.subtitle}>
          {goalMet
            ? 'Tuyệt vời! Bạn đã hoàn thành mục tiêu học tập hôm nay.'
            : `Còn ${Math.max(dailyGoalValue - current, 0)} ${unit} nữa là đạt mục tiêu hôm nay.`}
        </p>
        <ButtonLink to="/courses" leftIcon={<Target size={16} />}>
          Học ngay
        </ButtonLink>
      </div>
    </Card>
  )
}

export default TodayGoalCard
