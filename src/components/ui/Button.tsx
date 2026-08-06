import { forwardRef, useState, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from 'react'
import styles from './Button.module.scss'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  fullWidth?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

interface RippleItem {
  id: number
  x: number
  y: number
  size: number
}

let rippleId = 0

/** Button dùng chung toàn site - tự vẽ ripple effect khi click, không phụ thuộc Bootstrap .btn. */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    disabled,
    className,
    children,
    onClick,
    ...rest
  },
  ref,
) {
  const [ripples, setRipples] = useState<RippleItem[]>([])

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    const button = event.currentTarget
    const rect = button.getBoundingClientRect()
    const rippleSize = Math.max(rect.width, rect.height)
    const newRipple: RippleItem = {
      id: rippleId++,
      x: event.clientX - rect.left - rippleSize / 2,
      y: event.clientY - rect.top - rippleSize / 2,
      size: rippleSize,
    }
    setRipples((current) => [...current, newRipple])
    window.setTimeout(() => {
      setRipples((current) => current.filter((r) => r.id !== newRipple.id))
    }, 600)
    onClick?.(event)
  }

  const classNames = [styles.button, styles[variant], styles[size], fullWidth ? styles.fullWidth : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <button ref={ref} className={classNames} disabled={disabled || isLoading} onClick={handleClick} {...rest}>
      {isLoading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className={styles.ripple}
          style={{ left: ripple.x, top: ripple.y, width: ripple.size, height: ripple.size }}
        />
      ))}
    </button>
  )
})

export default Button
