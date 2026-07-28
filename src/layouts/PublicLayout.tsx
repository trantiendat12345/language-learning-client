import { Outlet } from 'react-router-dom'
import Navbar from '../components/common/Navbar'

function PublicLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <Outlet />
      </main>
    </div>
  )
}

export default PublicLayout
