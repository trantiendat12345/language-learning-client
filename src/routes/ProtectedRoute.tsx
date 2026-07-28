import { Navigate, Outlet } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'

/** Chặn truy cập nếu chưa đăng nhập - redirect về /login. */
function ProtectedRoute() {
  const { user, isLoading } = useAuthContext()

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

  return <Outlet />
}

export default ProtectedRoute
