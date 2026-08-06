import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Mail, MailCheck, TriangleAlert } from 'lucide-react'
import authService from '../../services/authService'
import { getApiErrorMessage } from '../../api/apiError'
import { Button, ButtonLink, Input } from '../../components/ui'
import type { ForgotPasswordRequest } from '../../types/auth'
import styles from './AuthForm.module.scss'

function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordRequest>()

  async function onSubmit(data: ForgotPasswordRequest) {
    setServerError(null)
    try {
      await authService.forgotPassword(data)
      // Message chung chung dù email tồn tại hay không - khớp Backend (chống dò tài khoản),
      // xem docs/testing/11_FRS_TC_AUTH.md mục 1.5.
      setSuccessMessage('Nếu email tồn tại trong hệ thống, link đặt lại mật khẩu đã được gửi.')
    } catch (error) {
      setServerError(getApiErrorMessage(error))
    }
  }

  if (successMessage) {
    return (
      <div className={styles.successState}>
        <span className={styles.successIcon}>
          <MailCheck size={32} />
        </span>
        <h1 className={styles.successTitle}>Kiểm tra email của bạn</h1>
        <p className={styles.successText}>{successMessage}</p>
        <ButtonLink to="/login" fullWidth>
          Về trang đăng nhập
        </ButtonLink>
      </div>
    )
  }

  return (
    <div>
      <h1 className={styles.heading}>Quên mật khẩu</h1>
      <p className={styles.subheading}>Nhập email đã đăng ký, chúng tôi sẽ gửi link đặt lại mật khẩu</p>

      {serverError && (
        <div className={`${styles.banner} ${styles.bannerError}`} role="alert">
          <TriangleAlert size={18} className={styles.bannerIcon} />
          <span>{serverError}</span>
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          id="email"
          label="Email"
          type="email"
          leftIcon={<Mail size={18} />}
          placeholder="ban@vidu.com"
          error={errors.email?.message}
          {...register('email', {
            required: 'Email không được để trống',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email không đúng định dạng' },
          })}
        />
        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Gửi link đặt lại mật khẩu
        </Button>
      </form>

      <p className={styles.footer}>
        <Link to="/login" className={styles.link}>
          Về trang đăng nhập
        </Link>
      </p>
    </div>
  )
}

export default ForgotPasswordPage
