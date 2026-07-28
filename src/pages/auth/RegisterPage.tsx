import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { useAuthContext } from '../../contexts/AuthContext'
import { getApiErrorMessage } from '../../api/apiError'
import type { RegisterRequest } from '../../types/auth'

// Rule khớp docs/testing/11_FRS_TC_AUTH.md mục 1.1 / RegisterRequest.java phía Backend -
// validate phía FE chỉ để UX phản hồi nhanh, Backend vẫn là nguồn xác thực cuối cùng.
const USERNAME_NO_WHITESPACE_PATTERN = /^\S+$/
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/

function RegisterPage() {
  const { register: registerUser } = useAuthContext()
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterRequest>()

  const password = useWatch({ control, name: 'password' })

  async function onSubmit(data: RegisterRequest) {
    setServerError(null)
    try {
      await registerUser(data)
      setSuccessMessage('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản trước khi đăng nhập.')
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
      <h1 className="h3 mb-4">Đăng ký</h1>
      {serverError && <div className="alert alert-danger">{serverError}</div>}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-3">
          <label className="form-label" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            className={`form-control ${errors.username ? 'is-invalid' : ''}`}
            {...register('username', {
              required: 'Username không được để trống',
              minLength: { value: 3, message: 'Username phải từ 3 đến 50 ký tự' },
              maxLength: { value: 50, message: 'Username phải từ 3 đến 50 ký tự' },
              pattern: { value: USERNAME_NO_WHITESPACE_PATTERN, message: 'Username không được chứa khoảng trắng' },
            })}
          />
          {errors.username && <div className="invalid-feedback">{errors.username.message}</div>}
        </div>
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
        <div className="mb-3">
          <label className="form-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
            {...register('password', {
              required: 'Password không được để trống',
              pattern: { value: PASSWORD_PATTERN, message: 'Password phải từ 8 ký tự trở lên, có ít nhất 1 chữ và 1 số' },
            })}
          />
          {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="confirmPassword">
            Xác nhận Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
            {...register('confirmPassword', {
              required: 'Confirm password không được để trống',
              validate: (value) => value === password || 'Confirm password không khớp với password',
            })}
          />
          {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword.message}</div>}
        </div>
        <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
          {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
      </form>
      <p className="mt-3">
        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
      </p>
    </div>
  )
}

export default RegisterPage
