import { useAuthContext } from '../contexts/AuthContext'

/** Placeholder trang sau đăng nhập - nội dung thật sẽ làm ở Giai đoạn 7 (Progress dashboard). */
function DashboardPage() {
  const { user } = useAuthContext()

  return (
    <div className="container py-5">
      <h1 className="h3">Xin chào, {user?.displayName ?? user?.username}</h1>
      <p className="text-muted">Email: {user?.email}</p>
      <p className="text-muted">Trạng thái tài khoản: {user?.status}</p>
    </div>
  )
}

export default DashboardPage
