import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import authService from '../../services/authService'
import { getApiErrorMessage } from '../../api/apiError'
import type { ForgotPasswordRequest } from '../../types/auth'

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
      <div className="container py-5" style={{ maxWidth: 420 }}>
        <div className="alert alert-success">{successMessage}</div>
        <Link to="/login" className="btn btn-primary">
          Về trang đăng nhập
        </Link>
      </div>
    )
  }

  return (
    <div className="container py-5" style={{ maxWidth: 420 }}>
      <h1 className="h3 mb-4">Quên mật khẩu</h1>
      {serverError && <div className="alert alert-danger">{serverError}</div>}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-3">
          <label className="form-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            {...register('email', {
              required: 'Email không được để trống',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email không đúng định dạng' },
            })}
          />
          {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
        </div>
        <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
          {isSubmitting ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
        </button>
      </form>
      <p className="mt-3">
        <Link to="/login">Về trang đăng nhập</Link>
      </p>
    </div>
  )
}

export default ForgotPasswordPage
