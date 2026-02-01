import { useEffect, useState } from 'react'
import { Bell, Calendar } from 'lucide-react'
import { getAnnouncements } from '../services/api'

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const loadAnnouncements = async () => {
    try {
      setLoading(true)
      const res: any = await getAnnouncements({ limit: 100 })
      setAnnouncements(res.data?.data || [])
    } catch (error) {
      console.error('加载公告失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="page-title">家族公告</h1>

      {announcements.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>暂无公告</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((item) => (
            <div key={item.id} className="card p-6">
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  item.is_pinned ? 'bg-[#c9a227] text-white' : 'bg-[#1e3a5f]/10 text-[#1e3a5f]'
                }`}>
                  <Bell className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-semibold text-[#1e3a5f]">{item.title}</h2>
                    {item.is_pinned && (
                      <span className="px-2 py-0.5 bg-[#c9a227] text-white text-xs rounded-full">
                        置顶
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 whitespace-pre-wrap">{item.content}</p>
                  <div className="flex items-center text-sm text-gray-400 mt-4">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(item.created_at).toLocaleDateString('zh-CN')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
