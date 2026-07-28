import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import authService from '../../services/authService'
import { getApiErrorMessage } from '../../api/apiError'

type VerifyStatus = 'verifying' | 'success' | 'error'

function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<VerifyStatus>('verifying')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    // token thiếu được xử lý ngay ở JSX bên dưới (render-time), không cần setState trong
    // effect cho case này - tránh cascading render không cần thiết.
    if (!token) {
      return
    }

    let cancelled = false
    async function verify() {
      try {
        await authService.verifyEmail(token as string)
        if (!cancelled) {
          setStatus('success')
        }
      } catch (error) {
        if (!cancelled) {
          setStatus('error')
          setErrorMessage(getApiErrorMessage(error))
        }
      }
    }
    verify()

    return () => {
      cancelled = true
    }
  }, [token])

  if (!token) {
    return (
      <div className="container py-5" style={{ maxWidth: 420 }}>
        <h1 className="h3 mb-4">Xác thực email</h1>
        <div className="alert alert-danger">Link xác thực không hợp lệ - thiếu token.</div>
        <Link to="/login" className="btn btn-outline-secondary">
          Về trang đăng nhập
        </Link>
      </div>
    )
  }

  return (
    <div className="container py-5" style={{ maxWidth: 420 }}>
      <h1 className="h3 mb-4">Xác thực email</h1>
      {status === 'verifying' && (
        <div className="d-flex align-items-center gap-2">
          <div className="spinner-border spinner-border-sm" role="status" />
          <span>Đang xác thực...</span>
        </div>
      )}
      {status === 'success' && (
        <>
          <div className="alert alert-success">Xác thực email thành công. Bạn có thể đăng nhập ngay bây giờ.</div>
          <Link to="/login" className="btn btn-primary">
            Đăng nhập
          </Link>
        </>
      )}
      {status === 'error' && (
        <>
          <div className="alert alert-danger">{errorMessage}</div>
          <Link to="/login" className="btn btn-outline-secondary">
            Về trang đăng nhập
          </Link>
        </>
      )}
    </div>
  )
}

export default VerifyEmailPage
