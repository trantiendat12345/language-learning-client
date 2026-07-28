import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import authService from '../../services/authService'
import { getApiErrorMessage } from '../../api/apiError'
import type { ResetPasswordRequest } from '../../types/auth'

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
      <div className="container py-5" style={{ maxWidth: 420 }}>
        <div className="alert alert-success">{successMessage}</div>
        <Link to="/login" className="btn btn-primary">
          Về trang đăng nhập
        </Link>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="container py-5" style={{ maxWidth: 420 }}>
        <div className="alert alert-danger">Link đặt lại mật khẩu không hợp lệ - thiếu token.</div>
        <Link to="/forgot-password" className="btn btn-primary">
          Yêu cầu link mới
        </Link>
      </div>
    )
  }

  return (
    <div className="container py-5" style={{ maxWidth: 420 }}>
      <h1 className="h3 mb-4">Đặt lại mật khẩu</h1>
      {serverError && <div className="alert alert-danger">{serverError}</div>}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-3">
          <label className="form-label" htmlFor="newPassword">
            Mật khẩu mới
          </label>
          <input
            id="newPassword"
            type="password"
            className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
            {...register('newPassword', {
              required: 'Password mới không được để trống',
              pattern: { value: PASSWORD_PATTERN, message: 'Password phải từ 8 ký tự trở lên, có ít nhất 1 chữ và 1 số' },
            })}
          />
          {errors.newPassword && <div className="invalid-feedback">{errors.newPassword.message}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="confirmNewPassword">
            Xác nhận mật khẩu mới
          </label>
          <input
            id="confirmNewPassword"
            type="password"
            className={`form-control ${errors.confirmNewPassword ? 'is-invalid' : ''}`}
            {...register('confirmNewPassword', {
              required: 'Confirm password mới không được để trống',
              validate: (value) => value === newPassword || 'Confirm password mới không khớp với password mới',
            })}
          />
          {errors.confirmNewPassword && <div className="invalid-feedback">{errors.confirmNewPassword.message}</div>}
        </div>
        <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
          {isSubmitting ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
        </button>
      </form>
    </div>
  )
}

export default ResetPasswordPage
