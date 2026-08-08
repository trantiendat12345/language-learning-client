import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Flame, KeyRound, Trophy, User as UserIcon } from 'lucide-react'
import { useAuthContext } from '../contexts/AuthContext'
import userService from '../services/userService'
import { getApiErrorMessage } from '../api/apiError'
import { Badge, Button, Card, Input, Select } from '../components/ui'
import type { ChangePasswordRequest, UserUpdateRequest } from '../types/user'
import styles from './ProfilePage.module.scss'

const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/

function ProfileHeader() {
  const { user } = useAuthContext()
  if (!user) return null

  const displayName = user.displayName || user.username
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <Card padding="lg" className={styles.headerCard}>
      {user.avatarUrl ? (
        <img src={user.avatarUrl} alt="" className={styles.avatar} />
      ) : (
        <span className={styles.avatarFallback}>{initial}</span>
      )}
      <div className={styles.headerInfo}>
        <h1 className={styles.displayName}>{displayName}</h1>
        <p className={styles.email}>{user.email}</p>
        <div className={styles.statsRow}>
          <Badge variant="primary" icon={<Trophy size={11} />}>
            {user.xp.toLocaleString('vi-VN')} XP
          </Badge>
          <Badge variant="accent" icon={<Flame size={11} />}>
            {user.currentStreak} ngày streak
          </Badge>
          {user.currentLevel && <Badge variant="secondary">{user.currentLevel}</Badge>}
        </div>
      </div>
    </Card>
  )
}

function EditProfileSection() {
  const { user, refreshUser } = useAuthContext()
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UserUpdateRequest>({
    defaultValues: {
      displayName: user?.displayName ?? '',
      avatarUrl: user?.avatarUrl ?? '',
      birthday: user?.birthday ?? '',
      gender: user?.gender ?? '',
      country: user?.country ?? '',
      currentLevel: user?.currentLevel ?? '',
      dailyGoalType: user?.dailyGoalType ?? 'WORDS',
      dailyGoalValue: user?.dailyGoalValue ?? 10,
    },
  })

  const dailyGoalType = useWatch({ control, name: 'dailyGoalType' })

  async function onSubmit(data: UserUpdateRequest) {
    setServerError(null)
    setSuccessMessage(null)
    try {
      await userService.updateMyProfile({ ...data, dailyGoalValue: Number(data.dailyGoalValue) })
      await refreshUser()
      setSuccessMessage('Cập nhật hồ sơ thành công')
    } catch (error) {
      setServerError(getApiErrorMessage(error))
    }
  }

  return (
    <Card padding="lg" className={styles.sectionCard}>
      <div className={styles.sectionTitle}>
        <span className={styles.sectionIcon}>
          <UserIcon size={16} />
        </span>
        <h2 className="h5" style={{ margin: 0 }}>
          Chỉnh sửa hồ sơ
        </h2>
      </div>

      {successMessage && <p className={styles.successText}>{successMessage}</p>}
      {serverError && <p className={styles.errorText}>{serverError}</p>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.formGrid}>
        <Input
          label="Tên hiển thị"
          error={errors.displayName?.message}
          {...register('displayName', { maxLength: { value: 100, message: 'Tên hiển thị tối đa 100 ký tự' } })}
        />
        <Input
          label="Avatar URL"
          error={errors.avatarUrl?.message}
          {...register('avatarUrl', { maxLength: { value: 500, message: 'Avatar URL tối đa 500 ký tự' } })}
        />
        <Input label="Ngày sinh" type="date" {...register('birthday')} />
        <Input label="Giới tính" {...register('gender', { maxLength: { value: 20, message: 'Tối đa 20 ký tự' } })} error={errors.gender?.message} />
        <Input
          label="Quốc gia"
          {...register('country', { maxLength: { value: 100, message: 'Tối đa 100 ký tự' } })}
          error={errors.country?.message}
        />
        <Input
          label="Trình độ hiện tại"
          placeholder="VD: A1, B2..."
          {...register('currentLevel', { maxLength: { value: 20, message: 'Tối đa 20 ký tự' } })}
          error={errors.currentLevel?.message}
        />
        <Select label="Mục tiêu hằng ngày" {...register('dailyGoalType', { required: true })}>
          <option value="WORDS">Theo số từ mới</option>
          <option value="TIME">Theo thời gian học</option>
        </Select>
        <Input
          label={`Chỉ tiêu (${dailyGoalType === 'TIME' ? 'phút/ngày' : 'từ/ngày'})`}
          type="number"
          min={1}
          error={errors.dailyGoalValue?.message}
          {...register('dailyGoalValue', { required: true, min: { value: 1, message: 'Chỉ tiêu tối thiểu là 1' }, valueAsNumber: true })}
        />

        <Button type="submit" isLoading={isSubmitting} className={styles.submitButton}>
          Lưu thay đổi
        </Button>
      </form>
    </Card>
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
    <Card padding="lg" className={styles.sectionCard}>
      <div className={styles.sectionTitle}>
        <span className={styles.sectionIcon}>
          <KeyRound size={16} />
        </span>
        <h2 className="h5" style={{ margin: 0 }}>
          Đổi mật khẩu
        </h2>
      </div>

      {successMessage && <p className={styles.successText}>{successMessage}</p>}
      {serverError && <p className={styles.errorText}>{serverError}</p>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.formStack}>
        <Input
          label="Mật khẩu hiện tại"
          type="password"
          error={errors.currentPassword?.message}
          {...register('currentPassword', { required: 'Mật khẩu hiện tại không được để trống' })}
        />
        <Input
          label="Mật khẩu mới"
          type="password"
          error={errors.newPassword?.message}
          {...register('newPassword', {
            required: 'Mật khẩu mới không được để trống',
            pattern: { value: PASSWORD_PATTERN, message: 'Mật khẩu phải từ 8 ký tự trở lên, có ít nhất 1 chữ và 1 số' },
          })}
        />
        <Input
          label="Xác nhận mật khẩu mới"
          type="password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Xác nhận mật khẩu không được để trống',
            validate: (value) => value === newPassword || 'Xác nhận mật khẩu không khớp',
          })}
        />
        <Button type="submit" isLoading={isSubmitting} className={styles.submitButton}>
          Đổi mật khẩu
        </Button>
      </form>
    </Card>
  )
}

function ProfilePage() {
  return (
    <div className={`container ${styles.page}`}>
      <ProfileHeader />
      <EditProfileSection />
      <ChangePasswordSection />
    </div>
  )
}

export default ProfilePage
