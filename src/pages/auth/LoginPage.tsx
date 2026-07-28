import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuthContext } from '../../contexts/AuthContext'
import { getApiErrorMessage } from '../../api/apiError'
import type { LoginRequest } from '../../types/auth'

function LoginPage() {
  const { login } = useAuthContext()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>()

  async function onSubmit(data: LoginRequest) {
    setServerError(null)
    try {
      await login(data)
      navigate('/dashboard')
    } catch (error) {
      setServerError(getApiErrorMessage(error))
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 420 }}>
      <h1 className="h3 mb-4">Đăng nhập</h1>
      {serverError && <div className="alert alert-danger">{serverError}</div>}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-3">
          <label className="form-label" htmlFor="usernameOrEmail">
            Username hoặc Email
          </label>
          <input
            id="usernameOrEmail"
            className={`form-control ${errors.usernameOrEmail ? 'is-invalid' : ''}`}
            {...register('usernameOrEmail', { required: 'Vui lòng nhập username hoặc email' })}
          />
          {errors.usernameOrEmail && <div className="invalid-feedback">{errors.usernameOrEmail.message}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
            {...register('password', { required: 'Vui lòng nhập password' })}
          />
          {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
        </div>
        <div className="mb-3 text-end">
          <Link to="/forgot-password">Quên mật khẩu?</Link>
        </div>
        <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
          {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
      <p className="mt-3">
        Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
      </p>
    </div>
  )
}

export default LoginPage
