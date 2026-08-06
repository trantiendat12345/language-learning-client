import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import styles from './Input.module.scss'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
}

/** Input dùng chung toàn site - forwardRef để tương thích react-hook-form register(). */
const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, leftIcon, id, className, type, ...rest },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={`${styles.inputWrapper} ${error ? styles.hasError : ''}`}>
        {leftIcon && (
          <span className={styles.leftIcon} aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          className={`${styles.input} ${leftIcon ? styles.withLeftIcon : ''} ${isPassword ? styles.withRightSlot : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            className={styles.togglePassword}
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error ? (
        <span id={`${inputId}-error`} className={styles.errorText}>
          {error}
        </span>
      ) : hint ? (
        <span id={`${inputId}-hint`} className={styles.hintText}>
          {hint}
        </span>
      ) : null}
    </div>
  )
})

export default Input
