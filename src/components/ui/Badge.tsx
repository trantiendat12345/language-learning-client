import type { HTMLAttributes, ReactNode } from 'react'
import styles from './Badge.module.scss'

export type BadgeVariant = 'neutral' | 'primary' | 'secondary' | 'accent' | 'success'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  icon?: ReactNode
}

function Badge({ variant = 'neutral', icon, className, children, ...rest }: BadgeProps) {
  return (
    <span className={[styles.badge, styles[variant], className].filter(Boolean).join(' ')} {...rest}>
      {icon}
      {children}
    </span>
  )
}

export default Badge
