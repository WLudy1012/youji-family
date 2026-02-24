import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Tag, message, Radio } from 'antd'
import { CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons'
import api from '../services/api'

export default function RegistrationRequests() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [reviewModalVisible, setReviewModalVisible] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [form] = Form.useForm()

  useEffect(() => {
    loadRequests()
  }, [activeTab])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const res: any = await api.get('/api/admin/registration-requests', {
        params: { status: activeTab }
      })
      setRequests(res.data.data || [])
    } catch (error) {
      message.error('加载申请列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = (record: any) => {
    setSelectedRequest(record)
    setDetailModalVisible(true)
  }

  const handleReview = (record: any) => {
    setSelectedRequest(record)
    form.resetFields()
    setReviewModalVisible(true)
  }

  const handleReviewSubmit = async () => {
    try {
      const values = await form.validateFields()
      await api.put(`/api/admin/registration-requests/${selectedRequest.id}`, values)
      message.success('审核完成')
      setReviewModalVisible(false)
      loadRequests()
    } catch (error) {
      message.error('审核失败')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '用户名', dataIndex: 'username' },
    { title: '真实姓名', dataIndex: 'real_name' },
    { title: '邮箱', dataIndex: 'email' },
    { title: '电话', dataIndex: 'phone' },
    {
      title: '申请时间',
      dataIndex: 'created_at',
      render: (date: string) => new Date(date).toLocaleString('zh-CN')
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: string) => {
        const statusMap: Record<string, { text: string; color: string }> = {
          pending: { text: '待审核', color: 'orange' },
          approved: { text: '已通过', color: 'green' },
          rejected: { text: '已拒绝', color: 'red' }
        }
        const { text, color } = statusMap[status] || { text: status, color: 'default' }
        return <Tag color={color}>{text}</Tag>
      }
    },
    {
      title: '操作',
      width: 200,
      render: (_: any, record: any) => (
        <div>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          {record.status === 'pending' && (
            <Button type="link" icon={<CheckOutlined />} onClick={() => handleReview(record)}>
              审核
            </Button>
          )}
        </div>
      )
    }
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">注册申请管理</h2>
      </div>

      {/* 标签切换 */}
      <div className="flex space-x-2 mb-6">
        <Button
          type={activeTab === 'pending' ? 'primary' : 'default'}
          onClick={() => setActiveTab('pending')}
        >
          待审核
        </Button>
        <Button
          type={activeTab === 'approved' ? 'primary' : 'default'}
          onClick={() => setActiveTab('approved')}
        >
          已通过
        </Button>
        <Button
          type={activeTab === 'rejected' ? 'primary' : 'default'}
          onClick={() => setActiveTab('rejected')}
        >
          已拒绝
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={requests}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* 详情弹窗 */}
      <Modal
        title="申请详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={
          selectedRequest?.status === 'pending' ? [
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              关闭
            </Button>,
            <Button
              key="review"
              type="primary"
              onClick={() => {
                setDetailModalVisible(false)
                handleReview(selectedRequest)
              }}
            >
              去审核
            </Button>
          ] : [
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              关闭
            </Button>
          ]
        }
        width={600}
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-500">用户名</label>
                <p className="font-medium">{selectedRequest.username}</p>
              </div>
              <div>
                <label className="text-gray-500">真实姓名</label>
                <p className="font-medium">{selectedRequest.real_name || '-'}</p>
              </div>
              <div>
                <label className="text-gray-500">邮箱</label>
                <p className="font-medium">{selectedRequest.email || '-'}</p>
              </div>
              <div>
                <label className="text-gray-500">电话</label>
                <p className="font-medium">{selectedRequest.phone || '-'}</p>
              </div>
            </div>
            <div>
              <label className="text-gray-500">申请理由</label>
              <p className="bg-gray-50 p-3 rounded mt-1">{selectedRequest.reason || '-'}</p>
            </div>
            <div>
              <label className="text-gray-500">申请时间</label>
              <p>{new Date(selectedRequest.created_at).toLocaleString('zh-CN')}</p>
            </div>
            {selectedRequest.status !== 'pending' && (
              <>
                <div>
                  <label className="text-gray-500">审核人</label>
                  <p>{selectedRequest.reviewer_name || '-'}</p>
                </div>
                <div>
                  <label className="text-gray-500">审核时间</label>
                  <p>{selectedRequest.reviewed_at ? new Date(selectedRequest.reviewed_at).toLocaleString('zh-CN') : '-'}</p>
                </div>
                {selectedRequest.review_note && (
                  <div>
                    <label className="text-gray-500">审核备注</label>
                    <p className="bg-gray-50 p-3 rounded mt-1">{selectedRequest.review_note}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </Modal>

      {/* 审核弹窗 */}
      <Modal
        title="审核注册申请"
        open={reviewModalVisible}
        onOk={handleReviewSubmit}
        onCancel={() => setReviewModalVisible(false)}
        width={500}
      >
        {selectedRequest && (
          <div className="mb-4 p-4 bg-gray-50 rounded">
            <p><strong>用户名：</strong>{selectedRequest.username}</p>
            <p><strong>真实姓名：</strong>{selectedRequest.real_name || '-'}</p>
            <p><strong>申请理由：</strong>{selectedRequest.reason || '-'}</p>
          </div>
        )}
        <Form form={form} layout="vertical">
          <Form.Item
            name="status"
            label="审核结果"
            rules={[{ required: true, message: '请选择审核结果' }]}
          >
            <Radio.Group>
              <Radio.Button value="approved">
                <CheckOutlined /> 通过
              </Radio.Button>
              <Radio.Button value="rejected">
                <CloseOutlined /> 拒绝
              </Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="review_note"
            label="审核备注"
          >
            <Input.TextArea
              rows={3}
              placeholder="请输入审核备注（可选）"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
