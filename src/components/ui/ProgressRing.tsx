import type { ReactNode } from 'react'
import styles from './ProgressRing.module.scss'

export interface ProgressRingProps {
  /** 0-100. Giá trị >100 bị kẹp lại 100 (vd học vượt mục tiêu vẫn hiển thị vòng tròn đầy). */
  percent: number
  size?: number
  strokeWidth?: number
  color?: string
  children?: ReactNode
}

/** Vòng tròn tiến độ dùng chung (Today's Goal, Course Progress...) - tự vẽ bằng SVG, không phụ thuộc thư viện chart. */
function ProgressRing({ percent, size = 96, strokeWidth = 10, color = 'var(--dl-primary-500)', children }: ProgressRingProps) {
  const clamped = Math.min(100, Math.max(0, percent))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - clamped / 100)

  return (
    <div className={styles.wrapper} style={{ width: size, height: size }}>
      <svg className={styles.svg} width={size} height={size}>
        <circle className={styles.track} cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} />
        <circle
          className={styles.progress}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      {children && <div className={styles.content}>{children}</div>}
    </div>
  )
}

export default ProgressRing
