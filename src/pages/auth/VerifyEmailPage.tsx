import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle2, TriangleAlert } from 'lucide-react'
import authService from '../../services/authService'
import { getApiErrorMessage } from '../../api/apiError'
import { ButtonLink, Spinner } from '../../components/ui'
import styles from './AuthForm.module.scss'

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
      <div className={styles.successState}>
        <span className={styles.errorIcon}>
          <TriangleAlert size={32} />
        </span>
        <h1 className={styles.successTitle}>Link không hợp lệ</h1>
        <p className={styles.successText}>Link xác thực không hợp lệ hoặc thiếu token.</p>
        <ButtonLink to="/login" variant="outline" fullWidth>
          Về trang đăng nhập
        </ButtonLink>
      </div>
    )
  }

  if (status === 'verifying') {
    return (
      <div className={styles.verifyingState}>
        <Spinner size="lg" />
        <span>Đang xác thực email...</span>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className={styles.successState}>
        <span className={styles.successIcon}>
          <CheckCircle2 size={32} />
        </span>
        <h1 className={styles.successTitle}>Xác thực thành công</h1>
        <p className={styles.successText}>Email của bạn đã được xác thực. Bạn có thể đăng nhập ngay bây giờ.</p>
        <ButtonLink to="/login" fullWidth>
          Đăng nhập
        </ButtonLink>
      </div>
    )
  }

  return (
    <div className={styles.successState}>
      <span className={styles.errorIcon}>
        <TriangleAlert size={32} />
      </span>
      <h1 className={styles.successTitle}>Xác thực thất bại</h1>
      <p className={styles.successText}>{errorMessage}</p>
      <ButtonLink to="/login" variant="outline" fullWidth>
        Về trang đăng nhập
      </ButtonLink>
    </div>
  )
}

export default VerifyEmailPage
