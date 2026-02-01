import { useEffect, useState } from 'react'
import { MessageSquare, Send, User, Calendar, MessageCircle } from 'lucide-react'
import { getGuestbook, createMessage } from '../services/api'

export default function Guestbook() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({ author_name: '', content: '' })
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = async () => {
    try {
      setLoading(true)
      const res: any = await getGuestbook({ limit: 100 })
      setMessages(res.data?.data || [])
    } catch (error) {
      console.error('加载留言失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.content.trim()) return

    try {
      setSubmitting(true)
      const res: any = await createMessage(formData)
      if (res.success) {
        setSuccessMsg('留言提交成功，等待审核后显示')
        setFormData({ author_name: '', content: '' })
        setTimeout(() => setSuccessMsg(''), 3000)
      }
    } catch (error) {
      console.error('提交留言失败:', error)
    } finally {
      setSubmitting(false)
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
      <h1 className="page-title">留言板</h1>

      {/* 留言表单 */}
      <div className="card p-6 mb-8">
        <h2 className="text-lg font-semibold text-[#1e3a5f] mb-4 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" />
          发表留言
        </h2>

        {successMsg && (
          <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-4">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              您的姓名
            </label>
            <input
              type="text"
              value={formData.author_name}
              onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
              placeholder="请输入您的姓名（选填）"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              留言内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="请输入您的留言..."
              rows={4}
              required
              maxLength={1000}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{formData.content.length}/1000</p>
          </div>

          <button
            type="submit"
            disabled={submitting || !formData.content.trim()}
            className="btn btn-primary disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                提交中...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                提交留言
              </>
            )}
          </button>
        </form>
      </div>

      {/* 留言列表 */}
      <div>
        <h2 className="text-lg font-semibold text-[#1e3a5f] mb-4">
          所有留言 ({messages.length})
        </h2>

        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>暂无留言，来说两句吧~</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="card p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#1e3a5f] rounded-full flex items-center justify-center text-white">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-[#1e3a5f]">{msg.author_name || '匿名'}</span>
                      <span className="text-sm text-gray-400 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(msg.created_at).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{msg.content}</p>

                    {/* 管理员回复 */}
                    {msg.reply_content && (
                      <div className="mt-4 bg-[#1e3a5f]/5 p-4 rounded-lg">
                        <p className="text-sm text-[#1e3a5f] font-medium mb-1">管理员回复：</p>
                        <p className="text-gray-600">{msg.reply_content}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
