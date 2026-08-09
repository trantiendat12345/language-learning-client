import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogOut, Users, ArrowLeftCircle, BookOpen, Globe, GraduationCap, HelpCircle } from 'lucide-react'
import { useAuthContext } from '../contexts/AuthContext'
import Logo from '../components/common/Logo'
import ThemeToggle from '../components/common/ThemeToggle'
import styles from './AdminLayout.module.scss'

const NAV_ITEMS = [
  { to: '/admin', label: 'Tổng quan', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Người dùng', icon: Users, end: false },
  { to: '/admin/courses', label: 'Khoá học', icon: BookOpen, end: false },
  { to: '/admin/vocabularies', label: 'Từ vựng', icon: GraduationCap, end: false },
  { to: '/admin/questions', label: 'Câu hỏi', icon: HelpCircle, end: false },
  { to: '/admin/languages', label: 'Ngôn ngữ', icon: Globe, end: false },
]

function AdminLayout() {
  const { user, logout } = useAuthContext()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <Logo />
          <span className={styles.adminTag}>Admin</span>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}>
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <ThemeToggle />
          <NavLink to="/dashboard" className={styles.footerLink}>
            <ArrowLeftCircle size={16} />
            Về trang chính
          </NavLink>
          <button type="button" className={styles.footerLink} onClick={handleLogout}>
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <span className={styles.topbarUser}>{user?.displayName ?? user?.username}</span>
        </header>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
