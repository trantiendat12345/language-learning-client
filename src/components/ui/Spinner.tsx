import styles from './Spinner.module.scss'

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  /** Bọc trong 1 khung căn giữa full-width, dùng cho trạng thái loading toàn trang/section. */
  centered?: boolean
}

function Spinner({ size = 'md', centered = false }: SpinnerProps) {
  const spinner = <span className={`${styles.spinner} ${styles[size]}`} role="status" aria-label="Đang tải" />

  if (centered) {
    return <div className={styles.center}>{spinner}</div>
  }
  return spinner
}

export default Spinner
