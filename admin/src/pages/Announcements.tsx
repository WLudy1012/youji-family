import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Switch, message, Popconfirm, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, PushpinOutlined } from '@ant-design/icons'
import api from '../services/api'

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const loadAnnouncements = async () => {
    try {
      setLoading(true)
      const res: any = await api.get('/api/admin/announcements', { params: { limit: 1000 } })
      setAnnouncements(res.data.data?.data || [])
    } catch (error) {
      message.error('加载公告失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingItem(null)
    form.setFieldsValue({ is_pinned: false, is_published: true })
    setModalVisible(true)
  }

  const handleEdit = (record: any) => {
    setEditingItem(record)
    form.setFieldsValue({
      ...record,
      is_pinned: Boolean(record.is_pinned),
      is_published: Boolean(record.is_published)
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/admin/announcements/${id}`)
      message.success('删除成功')
      loadAnnouncements()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      const payload = {
        ...values,
        is_pinned: values.is_pinned ? 1 : 0,
        is_published: values.is_published ? 1 : 0
      }

      if (editingItem) {
        await api.put(`/api/admin/announcements/${editingItem.id}`, payload)
        message.success('更新成功')
      } else {
        await api.post('/api/admin/announcements', payload)
        message.success('创建成功')
      }

      setModalVisible(false)
      loadAnnouncements()
    } catch (error) {
      console.error(error)
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { 
      title: '标题', 
      dataIndex: 'title',
      render: (text: string, record: any) => (
        <span>
          {text}
          {record.is_pinned === 1 && <Tag color="gold" style={{ marginLeft: 8 }}><PushpinOutlined /> 置顶</Tag>}
        </span>
      )
    },
    { 
      title: '状态', 
      dataIndex: 'is_published',
      render: (v: number) => v ? <span style={{ color: '#52c41a' }}>已发布</span> : <span style={{ color: '#999' }}>草稿</span>
    },
    {
      title: '操作',
      width: 150,
      render: (_: any, record: any) => (
        <div>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </div>
      )
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>公告管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>发布公告</Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={announcements}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingItem ? '编辑公告' : '发布公告'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true }]}>
            <Input.TextArea rows={6} />
          </Form.Item>
          <Form.Item name="is_pinned" label="置顶" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="is_published" label="发布" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
