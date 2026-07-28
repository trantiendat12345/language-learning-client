import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useAuthContext } from '../contexts/AuthContext'
import userService from '../services/userService'
import { getApiErrorMessage } from '../api/apiError'
import type { ChangePasswordRequest, UserUpdateRequest } from '../types/user'

const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/

function EditProfileSection() {
  const { user, refreshUser } = useAuthContext()
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserUpdateRequest>({
    defaultValues: {
      displayName: user?.displayName ?? '',
      avatarUrl: user?.avatarUrl ?? '',
      birthday: user?.birthday ?? '',
      gender: user?.gender ?? '',
      country: user?.country ?? '',
      currentLevel: user?.currentLevel ?? '',
    },
  })

  async function onSubmit(data: UserUpdateRequest) {
    setServerError(null)
    setSuccessMessage(null)
    try {
      await userService.updateMyProfile(data)
      await refreshUser()
      setSuccessMessage('Cập nhật hồ sơ thành công')
    } catch (error) {
      setServerError(getApiErrorMessage(error))
    }
  }

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h2 className="h5 mb-3">Chỉnh sửa hồ sơ</h2>
        {serverError && <div className="alert alert-danger">{serverError}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-3">
            <label className="form-label" htmlFor="displayName">
              Tên hiển thị
            </label>
            <input
              id="displayName"
              className={`form-control ${errors.displayName ? 'is-invalid' : ''}`}
              {...register('displayName', { maxLength: { value: 100, message: 'Tên hiển thị tối đa 100 ký tự' } })}
            />
            {errors.displayName && <div className="invalid-feedback">{errors.displayName.message}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="avatarUrl">
              Avatar URL
            </label>
            <input
              id="avatarUrl"
              className={`form-control ${errors.avatarUrl ? 'is-invalid' : ''}`}
              {...register('avatarUrl', { maxLength: { value: 500, message: 'Avatar URL tối đa 500 ký tự' } })}
            />
            {errors.avatarUrl && <div className="invalid-feedback">{errors.avatarUrl.message}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="birthday">
              Ngày sinh
            </label>
            <input id="birthday" type="date" className="form-control" {...register('birthday')} />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="gender">
              Giới tính
            </label>
            <input id="gender" className="form-control" {...register('gender')} />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="country">
              Quốc gia
            </label>
            <input id="country" className="form-control" {...register('country')} />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="currentLevel">
              Trình độ hiện tại
            </label>
            <input id="currentLevel" className="form-control" {...register('currentLevel')} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>
      </div>
    </div>
  )
}

function ChangePasswordSection() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordRequest>()

  const newPassword = useWatch({ control, name: 'newPassword' })

  async function onSubmit(data: ChangePasswordRequest) {
    setServerError(null)
    setSuccessMessage(null)
    try {
      await userService.changePassword(data)
      setSuccessMessage('Đổi mật khẩu thành công')
      reset()
    } catch (error) {
      setServerError(getApiErrorMessage(error))
    }
  }

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="h5 mb-3">Đổi mật khẩu</h2>
        {serverError && <div className="alert alert-danger">{serverError}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-3">
            <label className="form-label" htmlFor="currentPassword">
              Mật khẩu hiện tại
            </label>
            <input
              id="currentPassword"
              type="password"
              className={`form-control ${errors.currentPassword ? 'is-invalid' : ''}`}
              {...register('currentPassword', { required: 'Password hiện tại không được để trống' })}
            />
            {errors.currentPassword && <div className="invalid-feedback">{errors.currentPassword.message}</div>}
          </div>
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
            <label className="form-label" htmlFor="confirmPassword">
              Xác nhận mật khẩu mới
            </label>
            <input
              id="confirmPassword"
              type="password"
              className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
              {...register('confirmPassword', {
                required: 'Confirm password không được để trống',
                validate: (value) => value === newPassword || 'Confirm password không khớp với password',
              })}
            />
            {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword.message}</div>}
          </div>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
          </button>
        </form>
      </div>
    </div>
  )
}

function ProfilePage() {
  const { user } = useAuthContext()

  return (
    <div className="container py-5" style={{ maxWidth: 560 }}>
      <h1 className="h3 mb-1">Hồ sơ cá nhân</h1>
      <p className="text-muted mb-4">
        {user?.username} · {user?.email}
      </p>
      <EditProfileSection />
      <ChangePasswordSection />
    </div>
  )
}

export default ProfilePage
