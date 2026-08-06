import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { CheckCircle2, Lock, Mail, TriangleAlert, User } from 'lucide-react'
import { useAuthContext } from '../../contexts/AuthContext'
import { getApiErrorMessage } from '../../api/apiError'
import { Button, ButtonLink, Input } from '../../components/ui'
import type { RegisterRequest } from '../../types/auth'
import styles from './AuthForm.module.scss'

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
      setSuccessMessage('Đăng ký thành công! Bạn có thể đăng nhập ngay.')
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
        <h1 className={styles.successTitle}>Đăng ký thành công</h1>
        <p className={styles.successText}>{successMessage}</p>
        <ButtonLink to="/login" fullWidth>
          Về trang đăng nhập
        </ButtonLink>
      </div>
    )
  }

  return (
    <div>
      <h1 className={styles.heading}>Tạo tài khoản mới</h1>
      <p className={styles.subheading}>Bắt đầu hành trình học tiếng Anh của bạn ngay hôm nay</p>

      {serverError && (
        <div className={`${styles.banner} ${styles.bannerError}`} role="alert">
          <TriangleAlert size={18} className={styles.bannerIcon} />
          <span>{serverError}</span>
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          id="username"
          label="Username"
          leftIcon={<User size={18} />}
          placeholder="username_cua_ban"
          error={errors.username?.message}
          {...register('username', {
            required: 'Username không được để trống',
            minLength: { value: 3, message: 'Username phải từ 3 đến 50 ký tự' },
            maxLength: { value: 50, message: 'Username phải từ 3 đến 50 ký tự' },
            pattern: { value: USERNAME_NO_WHITESPACE_PATTERN, message: 'Username không được chứa khoảng trắng' },
          })}
        />
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
        <Input
          id="password"
          label="Mật khẩu"
          type="password"
          leftIcon={<Lock size={18} />}
          placeholder="Tối thiểu 8 ký tự"
          hint="Ít nhất 8 ký tự, có cả chữ và số"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password không được để trống',
            pattern: { value: PASSWORD_PATTERN, message: 'Password phải từ 8 ký tự trở lên, có ít nhất 1 chữ và 1 số' },
          })}
        />
        <Input
          id="confirmPassword"
          label="Xác nhận mật khẩu"
          type="password"
          leftIcon={<Lock size={18} />}
          placeholder="Nhập lại mật khẩu"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Confirm password không được để trống',
            validate: (value) => value === password || 'Confirm password không khớp với password',
          })}
        />
        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Đăng ký
        </Button>
      </form>

      <p className={styles.footer}>
        Đã có tài khoản?{' '}
        <Link to="/login" className={styles.link}>
          Đăng nhập
        </Link>
      </p>
    </div>
  )
}

export default RegisterPage
