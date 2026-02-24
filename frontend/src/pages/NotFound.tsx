import { Link } from 'react-router-dom'
import { Home, AlertCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <AlertCircle className="w-20 h-20 mx-auto mb-6 text-gray-300" />
      <h1 className="text-4xl font-bold text-[#1e3a5f] mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">页面不存在</p>
      <Link to="/" className="btn btn-primary inline-flex">
        <Home className="w-5 h-5 mr-2" />
        返回首页
      </Link>
    </div>
  )
}
