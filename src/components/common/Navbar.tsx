import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../contexts/AuthContext'

function Navbar() {
  const { user, logout } = useAuthContext()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand navbar-light bg-white border-bottom">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Language Learning
        </Link>
        <div className="d-flex align-items-center gap-3 ms-auto">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link d-inline">
                Dashboard
              </Link>
              <Link to="/profile" className="nav-link d-inline">
                {user.displayName ?? user.username}
              </Link>
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link d-inline">
                Đăng nhập
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
