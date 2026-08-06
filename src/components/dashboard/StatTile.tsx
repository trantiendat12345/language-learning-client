import type { ReactNode } from 'react'
import { Card } from '../ui'
import styles from './StatTile.module.scss'

export interface StatTileProps {
  icon: ReactNode
  iconBg: string
  iconColor: string
  value: string
  label: string
}

function StatTile({ icon, iconBg, iconColor, value, label }: StatTileProps) {
  return (
    <Card padding="md" className={styles.tile}>
      <span className={styles.icon} style={{ backgroundColor: iconBg, color: iconColor }} aria-hidden="true">
        {icon}
      </span>
      <div>
        <div className={styles.value}>{value}</div>
        <div className={styles.label}>{label}</div>
      </div>
    </Card>
  )
}

export default StatTile
