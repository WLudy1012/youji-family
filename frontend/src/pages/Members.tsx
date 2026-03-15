import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Sparkles } from 'lucide-react'
import { getMembers, getFamilyTree } from '../services/api'

export default function Members() {
  const [members, setMembers] = useState<any[]>([])
  const [treeData, setTreeData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'tree'>('grid')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [membersRes, treeRes] = await Promise.all([
        getMembers({ limit: 100 }),
        getFamilyTree()
      ])
      setMembers((membersRes as any).data?.data || [])
      setTreeData((treeRes as any).data)
    } catch (error) {
      console.error('加载成员数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const groupedMembers = members.reduce((acc, member) => {
    const gen = member.generation
    if (!acc[gen]) acc[gen] = []
    acc[gen].push(member)
    return acc
  }, {} as Record<number, any[]>)

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0">家族成员</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-lg ${viewMode === 'grid' ? 'bg-[#1e3a5f] text-white' : 'bg-gray-200'}`}
          >
            列表
          </button>
          <button
            onClick={() => setViewMode('tree')}
            className={`px-4 py-2 rounded-lg ${viewMode === 'tree' ? 'bg-[#1e3a5f] text-white' : 'bg-gray-200'}`}
          >
            族谱
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="space-y-8">
          {Object.entries(groupedMembers)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([generation, genMembers]) => (
              <div key={generation}>
                <h2 className="text-xl font-bold text-[#1e3a5f] mb-4 flex items-center">
                  <span className="w-8 h-8 bg-[#c9a227] text-white rounded-full flex items-center justify-center text-sm mr-3">
                    {generation}
                  </span>
                  第{generation}代
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {(genMembers as any[]).map((member) => (
                    <Link key={member.id} to={`/members/${member.id}`} className="card group">
                      <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        ) : (
                          <Users className="w-16 h-16 text-gray-300" />
                        )}
                      </div>
                      <div className="p-4 text-center">
                        <h3 className="font-semibold text-[#1e3a5f]">{member.name}</h3>
                        <p className="text-sm text-gray-500">{member.relation}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="card p-4 md:p-6 bg-gradient-to-b from-white/90 to-[#f8f3ff]">
          <FamilyTreeView data={treeData} />
        </div>
      )}
    </div>
  )
}

function FamilyTreeView({ data }: { data: any }) {
  if (!data) return <div className="text-center text-gray-500">暂无族谱数据</div>

  const { members } = data
  const byGeneration = members.reduce((acc: any, m: any) => {
    if (!acc[m.generation]) acc[m.generation] = []
    acc[m.generation].push(m)
    return acc
  }, {})

  const generations = Object.entries(byGeneration).sort(([a], [b]) => Number(a) - Number(b))

  return (
    <div>
      <div className="flex items-center gap-2 text-[#634e96] mb-4">
        <Sparkles className="w-4 h-4" />
        <span className="text-sm">族谱支持滚动浏览，点击头像查看成员详情</span>
      </div>

      <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-6">
        {generations.map(([gen, genMembers], index) => (
          <section key={gen} className="relative">
            <div className="sticky top-0 z-10 mb-3">
              <span className="inline-block px-3 py-1 rounded-full bg-[#1e3a5f] text-white text-sm shadow">
                第{gen}代
              </span>
            </div>

            {index !== generations.length - 1 && (
              <div className="absolute left-5 top-11 bottom-[-26px] w-px bg-gradient-to-b from-[#c9a227] to-transparent" />
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 pl-10">
              {(genMembers as any[]).map((member: any) => {
                const nickname = member.nickname || member.relation || member.name
                return (
                  <Link
                    key={member.id}
                    to={`/members/${member.id}`}
                    className="group rounded-2xl border border-[#1e3a5f]/15 bg-white/80 hover:bg-white p-3 transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full overflow-hidden flex items-center justify-center ring-2 ring-[#c9a227]/40 group-hover:ring-[#c9a227] transition-all">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="text-center mt-2">
                      <p className="font-semibold text-[#1e3a5f] text-sm line-clamp-1">{nickname}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{member.name}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
