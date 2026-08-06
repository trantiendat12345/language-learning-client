import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import styles from './Select.module.scss'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  children: ReactNode
}

/** Select dùng chung toàn site - forwardRef để tương thích react-hook-form register(). */
const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ label, id, className, children, ...rest }, ref) {
  const generatedId = useId()
  const selectId = id ?? generatedId

  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.wrapper}>
        <select ref={ref} id={selectId} className={styles.select} {...rest}>
          {children}
        </select>
        <span className={styles.chevron} aria-hidden="true">
          <ChevronDown size={16} />
        </span>
      </div>
    </div>
  )
})

export default Select
