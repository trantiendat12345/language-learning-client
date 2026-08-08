import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react'
import { useAuthContext } from '../../contexts/AuthContext'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import { Button, ButtonLink } from '../ui'
import styles from './Navbar.module.scss'

const NAV_LINKS = [
  { to: '/courses', label: 'Khoá học', requireAuth: false },
  { to: '/decks', label: 'Deck', requireAuth: false },
  { to: '/review', label: 'Ôn tập', requireAuth: true },
]

function Navbar() {
  const { user, isAdmin, logout } = useAuthContext()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const displayName = user?.displayName || user?.username || ''
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <header className={styles.header}>
      <div className={`container ${styles.bar}`}>
        <Logo />

        <nav className={styles.links}>
          {NAV_LINKS.filter((link) => !link.requireAuth || user).map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}>
              {link.label}
            </NavLink>
          ))}
          {user && (
            <NavLink to="/dashboard" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}>
              <LayoutDashboard size={14} />
              Dashboard
            </NavLink>
          )}
        </nav>

        <div className={styles.actions}>
          <ThemeToggle />
          {user ? (
            <>
              {isAdmin && (
                <NavLink to="/admin" className={styles.adminLink}>
                  <ShieldCheck size={14} />
                  Admin
                </NavLink>
              )}
              <NavLink to="/profile" className={styles.profileLink}>
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className={styles.avatar} />
                ) : (
                  <span className={styles.avatarFallback}>{initial}</span>
                )}
                <span className={styles.profileName}>{displayName}</span>
              </NavLink>
              <Button variant="ghost" size="sm" leftIcon={<LogOut size={14} />} onClick={handleLogout}>
                Đăng xuất
              </Button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}>
                Đăng nhập
              </NavLink>
              <ButtonLink to="/register" size="sm">
                Đăng ký
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
