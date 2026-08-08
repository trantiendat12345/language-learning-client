import { Navigate, Outlet } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'

/** Chặn truy cập nếu chưa đăng nhập (về /login) hoặc không có role ADMIN (về /dashboard). */
function AdminRoute() {
  const { user, isAdmin, isLoading } = useAuthContext()

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border" role="status" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export default AdminRoute
