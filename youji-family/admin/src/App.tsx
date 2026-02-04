import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Layout, Menu, Button, message, Avatar, Dropdown } from 'antd'
import {
  DashboardOutlined,
  TeamOutlined,
  FileTextOutlined,
  BellOutlined,
  PictureOutlined,
  MessageOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  DownOutlined,
  DownloadOutlined
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Members from './pages/Members'
import Articles from './pages/Articles'
import Announcements from './pages/Announcements'
import Albums from './pages/Albums'
import Guestbook from './pages/Guestbook'
import Settings from './pages/Settings'
import Backups from './pages/Backups'

const { Header, Sider, Content } = Layout

// 检查登录状态
const isAuthenticated = () => {
  return !!localStorage.getItem('admin_token')
}

// 获取用户信息
const getUserInfo = () => {
  const userStr = localStorage.getItem('admin_user')
  return userStr ? JSON.parse(userStr) : null
}

// 退出登录
const logout = () => {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_user')
  window.location.href = '/login'
}

// 主布局组件
function MainLayout() {
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const userInfo = getUserInfo()

  const menuItems: MenuProps['items'] = [
    { key: '/', icon: <DashboardOutlined />, label: '控制台' },
    { key: '/members', icon: <TeamOutlined />, label: '成员管理' },
    { key: '/articles', icon: <FileTextOutlined />, label: '文章管理' },
    { key: '/announcements', icon: <BellOutlined />, label: '公告管理' },
    { key: '/albums', icon: <PictureOutlined />, label: '相册管理' },
    { key: '/guestbook', icon: <MessageOutlined />, label: '留言管理' },
    { key: '/backups', icon: <DownloadOutlined />, label: '数据备份' },
    { key: '/settings', icon: <SettingOutlined />, label: '系统设置' },
  ]

  const userMenuItems: MenuProps['items'] = [
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: logout }
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="dark"
        style={{ background: '#1e3a5f' }}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#c9a227',
          fontSize: collapsed ? 14 : 18,
          fontWeight: 'bold',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          {collapsed ? '由基' : '由基家族后台'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={[window.location.pathname]}
          style={{ background: '#1e3a5f' }}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
        }}>
          <Button
            type="text"
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16 }}
          >
            {collapsed ? '展开' : '收起'}
          </Button>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} style={{ background: '#1e3a5f' }} />
              <span>{userInfo?.username || '管理员'}</span>
              <DownOutlined style={{ fontSize: 12 }} />
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 8, overflow: 'auto' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/members" element={<Members />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/albums" element={<Albums />} />
            <Route path="/guestbook" element={<Guestbook />} />
            <Route path="/backups" element={<Backups />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

// 受保护的路由
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
