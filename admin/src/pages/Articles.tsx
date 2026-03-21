import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import api from '../services/api'

export default function Articles() {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingArticle, setEditingArticle] = useState<any>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadArticles()
  }, [])

  const loadArticles = async () => {
    try {
      setLoading(true)
      const res: any = await api.get('/api/admin/articles', { params: { limit: 1000 } })
      setArticles(res.data.data?.data || [])
    } catch (error) {
      message.error('加载文章失败')
    } finally {
      setLoading(false)
    }
  }

  const loadArticleDetail = async (id: number) => {
    const res: any = await api.get(`/api/admin/articles/${id}`)
    return res.data.data
  }

  const handleAdd = () => {
    setEditingArticle(null)
    form.resetFields()
    form.setFieldsValue({ is_published: 1 })
    setModalVisible(true)
  }

  const handleEdit = async (record: any) => {
    try {
      setLoading(true)
      const detail = await loadArticleDetail(record.id)
      setEditingArticle(detail)
      form.setFieldsValue({
        ...detail,
        is_published: Number(detail.is_published)
      })
      setModalVisible(true)
    } catch (error) {
      message.error('加载文章详情失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/admin/articles/${id}`)
      message.success('删除成功')
      loadArticles()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)

      if (editingArticle) {
        await api.put(`/api/admin/articles/${editingArticle.id}`, values)
        message.success('更新成功')
      } else {
        await api.post('/api/admin/articles', values)
        message.success('创建成功')
      }

      setModalVisible(false)
      loadArticles()
    } catch (error) {
      if ((error as any)?.errorFields) {
        return
      }
      message.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '标题', dataIndex: 'title' },
    { title: '分类', dataIndex: 'category' },
    {
      title: '状态',
      dataIndex: 'is_published',
      render: (value: number) =>
        value ? <Tag color="green">已发布</Tag> : <Tag>草稿</Tag>
    },
    { title: '浏览', dataIndex: 'view_count', width: 80 },
    {
      title: '操作',
      width: 200,
      render: (_: any, record: any) => (
        <div>
          <Button type="link" icon={<EyeOutlined />} onClick={() => window.open(`/articles/${record.id}`, '_blank')}>
            查看
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </div>
      )
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>文章管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          发布文章
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={articles}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingArticle ? '编辑文章' : '发布文章'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        confirmLoading={saving}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="分类">
            <Input placeholder="家族历史" />
          </Form.Item>
          <Form.Item name="cover_image" label="封面图">
            <Input placeholder="/uploads/images/example.png" />
          </Form.Item>
          <Form.Item name="summary" label="摘要">
            <Input.TextArea rows={2} placeholder="文章简介" />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true }]}>
            <Input.TextArea rows={10} placeholder="支持 HTML 格式" />
          </Form.Item>
          <Form.Item name="is_published" label="发布状态" initialValue={1}>
            <Select options={[{ label: '已发布', value: 1 }, { label: '草稿', value: 0 }]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
