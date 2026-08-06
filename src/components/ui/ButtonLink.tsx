import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import buttonStyles from './Button.module.scss'
import type { ButtonSize, ButtonVariant } from './Button'

export interface ButtonLinkProps extends Omit<LinkProps, 'className'>, Pick<AnchorHTMLAttributes<HTMLAnchorElement>, 'target' | 'rel'> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  className?: string
}

/** Link điều hướng nhưng nhìn giống hệt Button - dùng khi hành động là chuyển trang, không submit form. */
function ButtonLink({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  const classNames = [
    buttonStyles.button,
    buttonStyles[variant],
    buttonStyles[size],
    fullWidth ? buttonStyles.fullWidth : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Link className={classNames} {...rest}>
      {leftIcon}
      {children}
      {rightIcon}
    </Link>
  )
}

export default ButtonLink
