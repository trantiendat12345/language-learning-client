import type { HTMLAttributes } from 'react'
import styles from './Card.module.scss'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

function Card({ hoverable = false, padding = 'md', className, children, ...rest }: CardProps) {
  const classNames = [styles.card, hoverable ? styles.hoverable : '', styles[padding], className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classNames} {...rest}>
      {children}
    </div>
  )
}

export default Card
