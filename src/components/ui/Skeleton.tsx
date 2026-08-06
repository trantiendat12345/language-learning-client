import type { CSSProperties } from 'react'
import styles from './Skeleton.module.scss'

export interface SkeletonProps {
  width?: string | number
  height?: string | number
  circle?: boolean
  className?: string
  style?: CSSProperties
}

/** Khối placeholder có hiệu ứng shimmer - dùng khi đang tải dữ liệu thay vì chỉ hiện Spinner. */
function Skeleton({ width = '100%', height = 16, circle = false, className, style }: SkeletonProps) {
  return (
    <span
      className={[styles.skeleton, circle ? styles.circle : '', className].filter(Boolean).join(' ')}
      style={{ width, height, display: 'block', ...style }}
      aria-hidden="true"
    />
  )
}

export default Skeleton
