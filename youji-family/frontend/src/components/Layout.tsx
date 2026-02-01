import { Outlet, Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Users, BookOpen, Image, MessageSquare, Bell, Home, Menu, X } from 'lucide-react'
import { getConfigs } from '../services/api'

interface SiteConfig {
  site_name: string
  site_logo: string
  footer_copyright: string
}

export default function Layout() {
  const location = useLocation()
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/members', label: '家族成员', icon: Users },
    { path: '/articles', label: '家族文章', icon: BookOpen },
    { path: '/albums', label: '家族相册', icon: Image },
    { path: '/announcements', label: '公告', icon: Bell },
    { path: '/guestbook', label: '留言板', icon: MessageSquare },
  ]

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* 导航栏 */}
      <header className="bg-[#1e3a5f] text-white shadow-lg sticky top-0 z-50">
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

            {/* 移动端菜单按钮 */}
            <button
              className="md:hidden p-2 hover:bg-white/10 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
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
          </nav>
        )}
      </header>

      {/* 主内容区 */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* 页脚 */}
      <footer className="bg-[#1e3a5f] text-white py-8">
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
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link to={item.path} className="text-white/70 hover:text-[#c9a227]">
                      {item.label}
                    </Link>
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
            </div>
          </div>

          <div className="border-t border-white/20 mt-8 pt-4 text-center text-sm text-white/50">
            {config?.footer_copyright || '© 2024 由基家族 版权所有'}
          </div>
        </div>
      </footer>
    </div>
  )
}
