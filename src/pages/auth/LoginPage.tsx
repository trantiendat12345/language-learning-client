import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { AlertCircle, Lock, Mail } from 'lucide-react'
import { useAuthContext } from '../../contexts/AuthContext'
import { getApiErrorMessage } from '../../api/apiError'
import { Button, Input } from '../../components/ui'
import type { LoginRequest } from '../../types/auth'
import styles from './AuthForm.module.scss'

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
    <div>
      <h1 className={styles.heading}>Chào mừng trở lại</h1>
      <p className={styles.subheading}>Đăng nhập để tiếp tục hành trình học tập của bạn</p>

      {serverError && (
        <div className={`${styles.banner} ${styles.bannerError}`} role="alert">
          <AlertCircle size={18} className={styles.bannerIcon} />
          <span>{serverError}</span>
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          id="usernameOrEmail"
          label="Username hoặc Email"
          leftIcon={<Mail size={18} />}
          placeholder="ban@vidu.com"
          error={errors.usernameOrEmail?.message}
          {...register('usernameOrEmail', { required: 'Vui lòng nhập username hoặc email' })}
        />
        <div>
          <Input
            id="password"
            label="Mật khẩu"
            type="password"
            leftIcon={<Lock size={18} />}
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password', { required: 'Vui lòng nhập password' })}
          />
          <div className={styles.row}>
            <Link to="/forgot-password" className={styles.link}>
              Quên mật khẩu?
            </Link>
          </div>
        </div>
        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Đăng nhập
        </Button>
      </form>

      <p className={styles.footer}>
        Chưa có tài khoản?{' '}
        <Link to="/register" className={styles.link}>
          Đăng ký ngay
        </Link>
      </p>
    </div>
  )
}

export default LoginPage
