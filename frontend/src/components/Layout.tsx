import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Users, BookOpen, Image, MessageSquare, Bell, Home, Menu, X, LogIn, LogOut, User } from 'lucide-react'
import { getConfigs } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import LoginModal from './LoginModal'

interface SiteConfig {
  site_name: string
  site_logo: string
  footer_copyright: string
}

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isLoggedIn, logout } = useAuth()
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const res: any = await getConfigs()
      if (res.success) {
        setConfig(res.data)
      }
    } catch (error) {
      console.error('加载配置失败:', error)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // 所有导航项（登录后显示）
  const allNavItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/members', label: '家族成员', icon: Users },
    { path: '/articles', label: '家族文章', icon: BookOpen },
    { path: '/albums', label: '家族相册', icon: Image },
    { path: '/announcements', label: '公告', icon: Bell },
    { path: '/guestbook', label: '留言板', icon: MessageSquare },
  ]

  // 访客只能看到首页
  const navItems = isLoggedIn ? allNavItems : [{ path: '/', label: '首页', icon: Home }]

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="app-shell min-h-screen flex flex-col">
      {/* 导航栏 */}
      <header className="bg-[#1e3a5f]/95 backdrop-blur text-white shadow-lg sticky top-0 z-40 border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              {config?.site_logo && (
                <img src={config.site_logo} alt="logo" className="h-10 w-10 object-contain" />
              )}
              <span className="text-xl font-bold">{config?.site_name || '由基家族'}</span>
            </Link>

            {/* 桌面导航 */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-[#c9a227] text-white'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* 右侧登录/用户信息 */}
            <div className="hidden md:flex items-center space-x-4">
              {isLoggedIn ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-[#c9a227] rounded-full flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-sm">{user?.member_name || user?.username}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>退出</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setLoginModalOpen(true)}
                  className="flex items-center space-x-1 px-4 py-2 bg-[#c9a227] hover:bg-[#d4b43a] rounded-lg transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>登录</span>
                </button>
              )}
            </div>

            {/* 移动端菜单按钮 */}
            <div className="flex items-center space-x-2 md:hidden">
              {isLoggedIn && (
                <div className="w-8 h-8 bg-[#c9a227] rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
              )}
              <button
                className="p-2 hover:bg-white/10 rounded-lg"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* 移动端导航 */}
        {mobileMenuOpen && (
          <nav className="md:hidden bg-[#152a45] border-t border-white/10">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-3 ${
                  isActive(item.path)
                    ? 'bg-[#c9a227] text-white'
                    : 'hover:bg-white/10'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
            {/* 移动端登录/退出 */}
            {isLoggedIn ? (
              <button
                onClick={() => {
                  handleLogout()
                  setMobileMenuOpen(false)
                }}
                className="w-full flex items-center space-x-2 px-4 py-3 text-red-400 hover:bg-white/10"
              >
                <LogOut className="w-5 h-5" />
                <span>退出登录</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setLoginModalOpen(true)
                  setMobileMenuOpen(false)
                }}
                className="w-full flex items-center space-x-2 px-4 py-3 text-[#c9a227] hover:bg-white/10"
              >
                <LogIn className="w-5 h-5" />
                <span>登录 / 注册</span>
              </button>
            )}
          </nav>
        )}
      </header>

      {/* 主内容区 */}
      <main className="flex-1 container mx-auto px-4 py-10">
        <Outlet />
      </main>

      {/* 页脚 */}
      <footer className="bg-[#14122a] text-white py-10 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {/* 关于 */}
            <div>
              <h3 className="text-lg font-bold mb-4">{config?.site_name || '由基家族'}</h3>
              <p className="text-white/70 text-sm">
                传承家族文化，凝聚家族力量。
              </p>
            </div>

            {/* 快速链接 */}
            <div>
              <h3 className="text-lg font-bold mb-4">快速链接</h3>
              <ul className="space-y-2 text-sm">
                {allNavItems.map((item) => (
                  <li key={item.path}>
                    {isLoggedIn || item.path === '/' ? (
                      <Link to={item.path} className="text-white/70 hover:text-[#c9a227]">
                        {item.label}
                      </Link>
                    ) : (
                      <span 
                        onClick={() => setLoginModalOpen(true)}
                        className="text-white/40 cursor-pointer hover:text-[#c9a227]"
                      >
                        {item.label} (需登录)
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* 联系方式 */}
            <div>
              <h3 className="text-lg font-bold mb-4">联系我们</h3>
              <p className="text-white/70 text-sm">
                如有问题或建议，请在留言板留言。
              </p>
              {!isLoggedIn && (
                <button
                  onClick={() => setLoginModalOpen(true)}
                  className="mt-4 px-4 py-2 bg-[#c9a227] hover:bg-[#d4b43a] rounded-lg text-sm transition-colors"
                >
                  登录 / 注册
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-white/20 mt-8 pt-4 text-center text-sm text-white/50">
            {config?.footer_copyright || '© 2024 由基家族 版权所有'}
          </div>
        </div>
      </footer>

      {/* 登录弹窗 */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={() => {
          // 登录成功后刷新页面以获取完整导航
          window.location.reload()
        }}
      />
    </div>
  )
}
