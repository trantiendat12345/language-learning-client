import { Navigate, Outlet } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'

/** Ngăn user đã đăng nhập quay lại trang Login/Register - redirect sang /dashboard. */
function PublicRoute() {
  const { user, isLoading } = useAuthContext()

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border" role="status" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export default PublicRoute
