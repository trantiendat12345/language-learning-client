import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import authService from '../services/authService'
import userService from '../services/userService'
import { getRolesFromToken, setAccessToken, setAuthFailureListener } from '../api/tokenStore'
import type { LoginRequest, RegisterRequest } from '../types/auth'
import type { UserResponse } from '../types/user'

interface AuthContextValue {
  user: UserResponse | null
  isAdmin: boolean
  isLoading: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<UserResponse>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setAuthFailureListener(() => {
      setUser(null)
      setIsAdmin(false)
    })
    return () => setAuthFailureListener(null)
  }, [])

  useEffect(() => {
    // Khôi phục phiên đăng nhập khi tải lại trang bằng refreshToken cookie (accessToken chỉ
    // sống in-memory nên mất ngay khi reload) - xem docs/PROJECT_OVERVIEW.md mục 8.
    async function restoreSession() {
      try {
        const { accessToken } = await authService.refreshToken()
        setAccessToken(accessToken)
        setIsAdmin(getRolesFromToken(accessToken).includes('ADMIN'))
        const profile = await userService.getMyProfile()
        setUser(profile)
      } catch {
        setAccessToken(null)
        setUser(null)
        setIsAdmin(false)
      } finally {
        setIsLoading(false)
      }
    }
    restoreSession()
  }, [])

  async function login(data: LoginRequest) {
    const { accessToken } = await authService.login(data)
    setAccessToken(accessToken)
    setIsAdmin(getRolesFromToken(accessToken).includes('ADMIN'))
    const profile = await userService.getMyProfile()
    setUser(profile)
  }

  async function register(data: RegisterRequest) {
    return authService.register(data)
  }

  async function logout() {
    try {
      await authService.logout()
    } finally {
      setAccessToken(null)
      setUser(null)
      setIsAdmin(false)
    }
  }

  async function refreshUser() {
    const profile = await userService.getMyProfile()
    setUser(profile)
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- Context + hook đi cùng nhau là quy ước bắt buộc (docs/dev/CODING_CONVENTIONS.md mục 2.1)
export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext phải được dùng bên trong AuthProvider')
  }
  return context
}
