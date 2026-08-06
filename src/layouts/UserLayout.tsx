import { Outlet } from 'react-router-dom'
import Navbar from '../components/common/Navbar'

/** Khung layout cho các trang yêu cầu đăng nhập (Dashboard/Profile...) - dùng chung Navbar với PublicLayout. */
function UserLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <Outlet />
      </main>
    </div>
  )
}

export default UserLayout
