import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, MapPin, Phone, Mail, ChevronLeft, User } from 'lucide-react'
import { getMember } from '../services/api'

export default function MemberDetail() {
  const { id } = useParams<{ id: string }>()
  const [member, setMember] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) loadMember()
  }, [id])

  const loadMember = async () => {
    try {
      setLoading(true)
      const res: any = await getMember(id!)
      if (res.success) {
        setMember(res.data)
      }
    } catch (error) {
      console.error('加载成员详情失败:', error)
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

  if (!member) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">成员不存在</p>
        <Link to="/members" className="text-[#1e3a5f] hover:underline mt-4 inline-block">
          返回成员列表
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/members" className="flex items-center text-[#1e3a5f] hover:text-[#c9a227] mb-6">
        <ChevronLeft className="w-5 h-5" />
        返回成员列表
      </Link>

      <div className="card overflow-hidden">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] p-8 text-white">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center overflow-hidden border-4 border-[#c9a227]">
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-white/50" />
              )}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold">{member.name}</h1>
              <p className="text-white/70 mt-2">{member.relation}</p>
              <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  第{member.generation}代
                </span>
                {member.gender !== 'unknown' && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {member.gender === 'male' ? '男' : '女'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 详情 */}
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* 基本信息 */}
            <div>
              <h2 className="text-xl font-bold text-[#1e3a5f] mb-4">基本信息</h2>
              <div className="space-y-3">
                {member.birth_date && (
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-3 text-[#c9a227]" />
                    <span>出生日期：{new Date(member.birth_date).toLocaleDateString('zh-CN')}</span>
                  </div>
                )}
                {member.death_date && (
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                    <span>逝世日期：{new Date(member.death_date).toLocaleDateString('zh-CN')}</span>
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-5 h-5 mr-3 text-[#c9a227]" />
                    <span>{member.phone}</span>
                  </div>
                )}
                {member.email && (
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-5 h-5 mr-3 text-[#c9a227]" />
                    <span>{member.email}</span>
                  </div>
                )}
                {member.address && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-3 text-[#c9a227]" />
                    <span>{member.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 家族关系 */}
            {member.relationships && (
              <div>
                <h2 className="text-xl font-bold text-[#1e3a5f] mb-4">家族关系</h2>
                <div className="space-y-4">
                  {member.relationships.parents?.length > 0 && (
                    <div>
                      <h3 className="text-sm text-gray-500 mb-2">父母</h3>
                      <div className="flex flex-wrap gap-2">
                        {member.relationships.parents.map((p: any) => (
                          <Link
                            key={p.id}
                            to={`/members/${p.id}`}
                            className="px-3 py-1 bg-[#1e3a5f]/10 text-[#1e3a5f] rounded-full text-sm hover:bg-[#1e3a5f] hover:text-white transition-colors"
                          >
                            {p.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {member.relationships.children?.length > 0 && (
                    <div>
                      <h3 className="text-sm text-gray-500 mb-2">子女</h3>
                      <div className="flex flex-wrap gap-2">
                        {member.relationships.children.map((c: any) => (
                          <Link
                            key={c.id}
                            to={`/members/${c.id}`}
                            className="px-3 py-1 bg-[#c9a227]/20 text-[#c9a227] rounded-full text-sm hover:bg-[#c9a227] hover:text-white transition-colors"
                          >
                            {c.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {member.relationships.spouses?.length > 0 && (
                    <div>
                      <h3 className="text-sm text-gray-500 mb-2">配偶</h3>
                      <div className="flex flex-wrap gap-2">
                        {member.relationships.spouses.map((s: any) => (
                          <Link
                            key={s.id}
                            to={`/members/${s.id}`}
                            className="px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-sm hover:bg-pink-500 hover:text-white transition-colors"
                          >
                            {s.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 个人简介 */}
          {member.bio && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-[#1e3a5f] mb-4">个人简介</h2>
              <div className="bg-gray-50 p-6 rounded-xl">
                <p className="text-gray-700 whitespace-pre-wrap">{member.bio}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
