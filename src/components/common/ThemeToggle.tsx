import { Moon, Sun } from 'lucide-react'
import { useThemeContext } from '../../contexts/ThemeContext'
import styles from './ThemeToggle.module.scss'

export interface ThemeToggleProps {
  /** Dùng trên nền tối/gradient - viền/nền kính mờ thay vì theo theme. */
  inverse?: boolean
}

function ThemeToggle({ inverse = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemeContext()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className={`${styles.toggle} ${inverse ? styles.inverse : ''}`}
      onClick={toggleTheme}
      aria-label={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
      title={isDark ? 'Chế độ sáng' : 'Chế độ tối'}
    >
      {isDark ? <Sun key="sun" size={18} className={styles.icon} /> : <Moon key="moon" size={18} className={styles.icon} />}
    </button>
  )
}

export default ThemeToggle
