import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import styles from './Logo.module.scss'

export interface LogoProps {
  /** Dùng trên nền tối/gradient (panel trái AuthLayout...) - chữ trắng thay vì theo theme. */
  inverse?: boolean
  to?: string
}

function Logo({ inverse = false, to = '/' }: LogoProps) {
  return (
    <Link to={to} className={`${styles.logo} ${inverse ? styles.inverse : ''}`}>
      <span className={styles.mark} aria-hidden="true">
        <Sparkles size={18} strokeWidth={2.25} />
      </span>
      Language Learning
    </Link>
  )
}

export default Logo
