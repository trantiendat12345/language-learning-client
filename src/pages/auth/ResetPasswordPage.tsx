import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { CheckCircle2, Lock, TriangleAlert } from 'lucide-react'
import authService from '../../services/authService'
import { getApiErrorMessage } from '../../api/apiError'
import { Button, ButtonLink, Input } from '../../components/ui'
import type { ResetPasswordRequest } from '../../types/auth'
import styles from './AuthForm.module.scss'

const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/

// Form chỉ nhập newPassword/confirmNewPassword - token lấy từ query string (?token=...)
// trong link email, không phải field người dùng gõ tay.
type ResetPasswordFormData = Omit<ResetPasswordRequest, 'token'>

function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>()

  const newPassword = useWatch({ control, name: 'newPassword' })

  async function onSubmit(data: ResetPasswordFormData) {
    if (!token) {
      setServerError('Link đặt lại mật khẩu không hợp lệ - thiếu token.')
      return
    }
    setServerError(null)
    try {
      await authService.resetPassword({ token, ...data })
      setSuccessMessage('Đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới.')
    } catch (error) {
      setServerError(getApiErrorMessage(error))
    }
  }

  if (successMessage) {
    return (
      <div className={styles.successState}>
        <span className={styles.successIcon}>
          <CheckCircle2 size={32} />
        </span>
        <h1 className={styles.successTitle}>Đặt lại mật khẩu thành công</h1>
        <p className={styles.successText}>{successMessage}</p>
        <ButtonLink to="/login" fullWidth>
          Về trang đăng nhập
        </ButtonLink>
      </div>
    )
  }

  if (!token) {
    return (
      <div className={styles.successState}>
        <span className={styles.errorIcon}>
          <TriangleAlert size={32} />
        </span>
        <h1 className={styles.successTitle}>Link không hợp lệ</h1>
        <p className={styles.successText}>Link đặt lại mật khẩu không hợp lệ hoặc thiếu token.</p>
        <ButtonLink to="/forgot-password" fullWidth>
          Yêu cầu link mới
        </ButtonLink>
      </div>
    )
  }

  return (
    <div>
      <h1 className={styles.heading}>Đặt lại mật khẩu</h1>
      <p className={styles.subheading}>Nhập mật khẩu mới cho tài khoản của bạn</p>

      {serverError && (
        <div className={`${styles.banner} ${styles.bannerError}`} role="alert">
          <TriangleAlert size={18} className={styles.bannerIcon} />
          <span>{serverError}</span>
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          id="newPassword"
          label="Mật khẩu mới"
          type="password"
          leftIcon={<Lock size={18} />}
          placeholder="Tối thiểu 8 ký tự"
          hint="Ít nhất 8 ký tự, có cả chữ và số"
          error={errors.newPassword?.message}
          {...register('newPassword', {
            required: 'Password mới không được để trống',
            pattern: { value: PASSWORD_PATTERN, message: 'Password phải từ 8 ký tự trở lên, có ít nhất 1 chữ và 1 số' },
          })}
        />
        <Input
          id="confirmNewPassword"
          label="Xác nhận mật khẩu mới"
          type="password"
          leftIcon={<Lock size={18} />}
          placeholder="Nhập lại mật khẩu mới"
          error={errors.confirmNewPassword?.message}
          {...register('confirmNewPassword', {
            required: 'Confirm password mới không được để trống',
            validate: (value) => value === newPassword || 'Confirm password mới không khớp với password mới',
          })}
        />
        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Đặt lại mật khẩu
        </Button>
      </form>
    </div>
  )
}

export default ResetPasswordPage
