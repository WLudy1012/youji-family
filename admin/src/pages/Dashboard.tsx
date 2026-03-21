import { useEffect, useMemo, useState } from 'react'
import { Card, Row, Col, Statistic, Segmented, Empty } from 'antd'
import { TeamOutlined, FileTextOutlined, PictureOutlined, MessageOutlined, LineChartOutlined, UserOutlined } from '@ant-design/icons'
import api from '../services/api'

type TrendPoint = {
  label: string
  count: number
}

type VisitStats = {
  today: number
  yesterday: number
  last7Days: number
  last30Days: number
  totalUniqueVisitors: number
}

function VisitLineChart({ data }: { data: TrendPoint[] }) {
  if (!data.length) return <Empty description="暂无统计数据" />

  const width = 760
  const height = 240
  const padding = 28
  const max = Math.max(...data.map((d) => d.count), 1)

  const points = data
    .map((item, index) => {
      const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1)
      const y = height - padding - (item.count / max) * (height - padding * 2)
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 260 }}>
        <defs>
          <linearGradient id="visitArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.38" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {data.map((item, index) => {
          const y = height - padding - (item.count / max) * (height - padding * 2)
          return (
            <line
              key={`grid-${index}`}
              x1={padding}
              x2={width - padding}
              y1={y}
              y2={y}
              stroke="rgba(69,183,209,0.15)"
              strokeDasharray="3 4"
            />
          )
        })}

        <polyline
          fill="url(#visitArea)"
          stroke="none"
          points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
        />

        <polyline
          fill="none"
          stroke="var(--secondary)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />

        {data.map((item, index) => {
          const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1)
          const y = height - padding - (item.count / max) * (height - padding * 2)
          return (
            <g key={`point-${item.label}-${index}`}>
              <circle cx={x} cy={y} r="4" fill="var(--accent)" />
            </g>
          )
        })}
      </svg>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(data.length, 8)}, 1fr)`, gap: 8, marginTop: 8 }}>
        {data
          .filter((_, idx) => idx % Math.ceil(data.length / 8 || 1) === 0)
          .map((item) => (
            <div key={`label-${item.label}`} style={{ fontSize: 12, color: 'var(--text)' }}>
              {item.label}
            </div>
          ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    members: 0,
    articles: 0,
    albums: 0,
    messages: 0
  })
  const [visitStats, setVisitStats] = useState<VisitStats>({
    today: 0,
    yesterday: 0,
    last7Days: 0,
    last30Days: 0,
    totalUniqueVisitors: 0
  })
  const [visitTrends, setVisitTrends] = useState({
    last24Hours: [] as TrendPoint[],
    last7Days: [] as TrendPoint[],
    last30Days: [] as TrendPoint[]
  })
  const [period, setPeriod] = useState<'24h' | '7d' | '30d'>('7d')

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [membersRes, articlesRes, albumsRes, messagesRes, visitsRes] = await Promise.all([
        api.get('/api/members', { params: { limit: 1 } }),
        api.get('/api/articles', { params: { limit: 1 } }),
        api.get('/api/albums', { params: { limit: 1 } }),
        api.get('/api/admin/guestbook', { params: { limit: 1 } }),
        api.get('/api/admin/visits/stats')
      ])

      setStats({
        members: membersRes.data.data?.pagination?.total || 0,
        articles: articlesRes.data.data?.pagination?.total || 0,
        albums: albumsRes.data.data?.pagination?.total || 0,
        messages: messagesRes.data.data?.pagination?.total || 0
      })

      setVisitStats(visitsRes.data.data?.summary || visitStats)
      setVisitTrends(visitsRes.data.data?.trends || visitTrends)
    } catch (error) {
      console.error('加载统计数据失败:', error)
    }
  }

  const selectedTrend = useMemo(() => {
    if (period === '24h') return visitTrends.last24Hours
    if (period === '30d') return visitTrends.last30Days
    return visitTrends.last7Days
  }, [period, visitTrends])

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>控制台</h2>

      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="家族成员" value={stats.members} prefix={<TeamOutlined />} valueStyle={{ color: 'var(--secondary)' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="文章数量" value={stats.articles} prefix={<FileTextOutlined />} valueStyle={{ color: 'var(--primary)' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="相册数量" value={stats.albums} prefix={<PictureOutlined />} valueStyle={{ color: 'var(--accent)' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="留言数量" value={stats.messages} prefix={<MessageOutlined />} valueStyle={{ color: 'var(--accent)' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="今日访问人数" value={visitStats.today} prefix={<UserOutlined />} valueStyle={{ color: 'var(--primary)' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="昨日访问人数" value={visitStats.yesterday} valueStyle={{ color: 'var(--secondary)' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="近7天访问人数" value={visitStats.last7Days} valueStyle={{ color: 'var(--accent)' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="累计访问人数" value={visitStats.totalUniqueVisitors} valueStyle={{ color: 'var(--secondary)' }} />
          </Card>
        </Col>
      </Row>

      <Card
        style={{ marginTop: 24 }}
        title="访问趋势统计图"
        extra={
          <Segmented
            options={[
              { label: '近24小时', value: '24h' },
              { label: '近7天', value: '7d' },
              { label: '近30天', value: '30d' }
            ]}
            value={period}
            onChange={(value) => setPeriod(value as '24h' | '7d' | '30d')}
          />
        }
      >
        <VisitLineChart data={selectedTrend} />
      </Card>

      <Card style={{ marginTop: 24 }} title="欢迎使用由基家族管理后台" extra={<LineChartOutlined />}>
        <p>在这里您可以：</p>
        <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
          <li>管理家族成员信息和关系</li>
          <li>发布和编辑家族文章</li>
          <li>管理家族相册</li>
          <li>发布公告通知</li>
          <li>审核留言板内容</li>
          <li>查看访问统计趋势与分时段数据</li>
        </ul>
      </Card>
    </div>
  )
}
