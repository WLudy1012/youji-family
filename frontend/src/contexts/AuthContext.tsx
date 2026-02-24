import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'

interface User {
  id: number
  member_id: number
  username: string
  email: string
  member_name: string
  avatar: string | null
}

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  isLoading: boolean
  login: (token: string, user: User) => void
  logout: () => void
  checkAuth: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 初始化时检查登录状态
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async (): Promise<boolean> => {
    const token = localStorage.getItem('member_token')
    if (!token) {
      setIsLoading(false)
      return false
    }

    try {
      // 设置axios默认header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      // 验证token有效性
      const res: any = await axios.get('/api/auth/member/profile')
      if (res.data.success) {
        setUser(res.data.data)
        setIsLoading(false)
        return true
      }
    } catch (error) {
      // token无效，清除本地存储
      localStorage.removeItem('member_token')
      localStorage.removeItem('member_user')
      delete axios.defaults.headers.common['Authorization']
    }
    
    setIsLoading(false)
    return false
  }

  const login = (token: string, userData: User) => {
    localStorage.setItem('member_token', token)
    localStorage.setItem('member_user', JSON.stringify(userData))
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('member_token')
    localStorage.removeItem('member_user')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoading,
        login,
        logout,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
