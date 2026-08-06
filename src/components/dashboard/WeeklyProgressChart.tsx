import { Card } from '../ui'
import type { WeeklyProgressDay } from '../../mock/dashboardMock'
import styles from './WeeklyProgressChart.module.scss'

export interface WeeklyProgressChartProps {
  days: WeeklyProgressDay[]
}

/** getDay(): 0=CN...6=T7 -> map sang index mảng days (0=T2...6=CN) để tô đậm đúng cột "hôm nay". */
function getTodayIndex(): number {
  const jsDay = new Date().getDay()
  return jsDay === 0 ? 6 : jsDay - 1
}

function WeeklyProgressChart({ days }: WeeklyProgressChartProps) {
  const maxMinutes = Math.max(...days.map((d) => d.minutes), 1)
  const todayIndex = getTodayIndex()

  return (
    <Card padding="lg">
      <div className={styles.header}>
        <h2 className="h5" style={{ margin: 0 }}>
          Tiến độ tuần này
        </h2>
      </div>
      <div className={styles.chart}>
        {days.map((day, index) => (
          <div className={styles.col} key={day.label}>
            <div className={styles.barTrack}>
              <div
                className={`${styles.bar} ${index === todayIndex ? styles.barToday : ''}`}
                style={{ height: `${(day.minutes / maxMinutes) * 100}%` }}
                title={`${day.minutes} phút`}
              />
            </div>
            <span className={styles.minutesLabel}>{day.minutes}</span>
            <span className={styles.dayLabel}>{day.label}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default WeeklyProgressChart
