import { ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './Pagination.module.scss'

export interface PaginationProps {
  /** 0-indexed, khớp PageResponse.page của Backend. */
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

const ELLIPSIS = 'ellipsis' as const

/** Tính danh sách số trang hiển thị: luôn có trang đầu/cuối, quanh trang hiện tại, còn lại rút gọn bằng "...". */
function getPageItems(current: number, total: number): (number | typeof ELLIPSIS)[] {
  const items: (number | typeof ELLIPSIS)[] = []
  const windowStart = Math.max(1, current - 1)
  const windowEnd = Math.min(total - 2, current + 1)

  items.push(0)
  if (windowStart > 1) items.push(ELLIPSIS)
  for (let i = windowStart; i <= windowEnd; i++) items.push(i)
  if (windowEnd < total - 2) items.push(ELLIPSIS)
  if (total > 1) items.push(total - 1)

  return items
}

function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const items = getPageItems(page, totalPages)

  return (
    <nav className={styles.pagination} aria-label="Phân trang">
      <button
        type="button"
        className={styles.button}
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
        aria-label="Trang trước"
      >
        <ChevronLeft size={16} />
      </button>

      {items.map((item, index) =>
        item === ELLIPSIS ? (
          <span className={styles.ellipsis} key={`ellipsis-${index}`}>
            …
          </span>
        ) : (
          <button
            type="button"
            key={item}
            className={`${styles.button} ${item === page ? styles.active : ''}`}
            onClick={() => onPageChange(item)}
            aria-current={item === page ? 'page' : undefined}
          >
            {item + 1}
          </button>
        ),
      )}

      <button
        type="button"
        className={styles.button}
        disabled={page + 1 >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Trang sau"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  )
}

export default Pagination
