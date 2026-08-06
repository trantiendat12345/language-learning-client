import { Outlet } from 'react-router-dom'
import { Flame, Trophy, BookOpen } from 'lucide-react'
import Logo from '../components/common/Logo'
import ThemeToggle from '../components/common/ThemeToggle'
import styles from './AuthLayout.module.scss'

const FEATURES = [
  { icon: BookOpen, text: 'Hàng trăm bài học từ cơ bản đến nâng cao' },
  { icon: Flame, text: 'Giữ streak học tập mỗi ngày' },
  { icon: Trophy, text: 'Theo dõi tiến độ, đạt mục tiêu của riêng bạn' },
]

/** Layout 2 cột cho toàn bộ luồng Auth (Login/Register/Forgot/Reset/VerifyEmail). */
function AuthLayout() {
  return (
    <div className={styles.wrapper}>
      <aside className={styles.brandPanel}>
        <span className={`${styles.blob} ${styles.blob1}`} aria-hidden="true" />
        <span className={`${styles.blob} ${styles.blob2}`} aria-hidden="true" />
        <Logo inverse />
        <div className={styles.brandContent}>
          <h1 className={styles.brandTitle}>Học tiếng Anh mỗi ngày, đạt mục tiêu của bạn</h1>
          <p className={styles.brandSubtitle}>
            Bài học, flashcard và quiz được thiết kế để giúp bạn tiến bộ mỗi ngày — theo đúng tốc độ của riêng bạn.
          </p>
          <ul className={styles.featureList}>
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className={styles.featureItem}>
                <span className={styles.featureIcon} aria-hidden="true">
                  <Icon size={18} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className={styles.brandFooter}>© {new Date().getFullYear()} Language Learning</p>
      </aside>

      <div className={styles.formPanel}>
        <div className={styles.formTopbar}>
          <Logo />
          <ThemeToggle />
        </div>
        <div className={styles.formContent}>
          <div className={styles.formInner}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
