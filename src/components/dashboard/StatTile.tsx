import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../ui'
import styles from './StatTile.module.scss'

export interface StatTileProps {
  icon: ReactNode
  iconBg: string
  iconColor: string
  value: string
  label: string
  /** Nếu có, cả tile trở thành link điều hướng (vd "Từ cần ôn tập" -> /review). */
  to?: string
}

function StatTile({ icon, iconBg, iconColor, value, label, to }: StatTileProps) {
  const content = (
    <Card padding="md" hoverable={!!to} className={styles.tile}>
      <span className={styles.icon} style={{ backgroundColor: iconBg, color: iconColor }} aria-hidden="true">
        {icon}
      </span>
      <div>
        <div className={styles.value}>{value}</div>
        <div className={styles.label}>{label}</div>
      </div>
    </Card>
  )

  if (!to) return content

  return (
    <Link to={to} className={styles.link}>
      {content}
    </Link>
  )
}

export default StatTile
