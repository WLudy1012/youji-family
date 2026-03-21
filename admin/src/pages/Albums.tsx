import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Upload, message, Popconfirm, Image, Switch, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import api from '../services/api'

export default function Albums() {
  const [albums, setAlbums] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [editingAlbum, setEditingAlbum] = useState<any>(null)
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadAlbums()
  }, [])

  const loadAlbums = async () => {
    try {
      setLoading(true)
      const res: any = await api.get('/api/admin/albums', { params: { limit: 1000 } })
      setAlbums(res.data.data?.data || [])
    } catch (error) {
      message.error('加载相册失败')
    } finally {
      setLoading(false)
    }
  }

  const loadAlbumDetail = async (id: number) => {
    const res: any = await api.get(`/api/admin/albums/${id}`)
    return res.data.data
  }

  const openAlbumDetail = async (id: number) => {
    const detail = await loadAlbumDetail(id)
    setSelectedAlbum(detail)
    setDetailModalVisible(true)
  }

  const handleAdd = () => {
    setEditingAlbum(null)
    form.resetFields()
    form.setFieldsValue({ is_public: true })
    setModalVisible(true)
  }

  const handleEdit = (record: any) => {
    setEditingAlbum(record)
    form.setFieldsValue({
      ...record,
      is_public: Boolean(record.is_public)
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/admin/albums/${id}`)
      message.success('删除成功')
      loadAlbums()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleView = async (record: any) => {
    try {
      setLoading(true)
      await openAlbumDetail(record.id)
    } catch (error) {
      message.error('加载相册详情失败')
    } finally {
      setLoading(false)
    }
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)

      const payload = {
        ...values,
        is_public: values.is_public ? 1 : 0
      }

      if (editingAlbum) {
        await api.put(`/api/admin/albums/${editingAlbum.id}`, payload)
        message.success('更新成功')
      } else {
        await api.post('/api/admin/albums', payload)
        message.success('创建成功')
      }

      setModalVisible(false)
      loadAlbums()
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
    {
      title: '封面',
      dataIndex: 'cover_image',
      width: 100,
      render: (url: string) =>
        url ? <Image src={url} width={80} height={60} style={{ objectFit: 'cover' }} /> : '-'
    },
    { title: '名称', dataIndex: 'name' },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    {
      title: '状态',
      dataIndex: 'is_public',
      width: 100,
      render: (value: number) => (value ? <Tag color="green">公开</Tag> : <Tag>私密</Tag>)
    },
    {
      title: '操作',
      width: 220,
      render: (_: any, record: any) => (
        <div>
          <Button type="link" onClick={() => handleView(record)}>
            管理图片
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
        <h2>相册管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          创建相册
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={albums}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingAlbum ? '编辑相册' : '创建相册'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="相册名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="相册描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="cover_image" label="封面图片">
            <Input placeholder="图片 URL" />
          </Form.Item>
          <Form.Item name="is_public" label="公开显示" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={selectedAlbum?.name}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        <p>{selectedAlbum?.description}</p>
        <Upload.Dragger
          name="image"
          multiple
          action="/api/admin/upload/image?type=albums"
          headers={{ Authorization: `Bearer ${localStorage.getItem('admin_token')}` }}
          onChange={async (info) => {
            if (!selectedAlbum) {
              return
            }

            if (info.file.status === 'done') {
              try {
                await api.post(`/api/admin/albums/${selectedAlbum.id}/images`, {
                  image_path: info.file.response.data.url
                })
                message.success(`${info.file.name} 上传成功`)
                const detail = await loadAlbumDetail(selectedAlbum.id)
                setSelectedAlbum(detail)
              } catch (error) {
                message.error('写入相册失败')
              }
            }

            if (info.file.status === 'error') {
              message.error(`${info.file.name} 上传失败`)
            }
          }}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽图片到此区域上传</p>
        </Upload.Dragger>

        <div style={{ marginTop: 16 }}>
          <h4>相册图片</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {selectedAlbum?.images?.map((img: any) => (
              <Image key={img.id} src={img.image_path} width={120} height={120} style={{ objectFit: 'cover' }} />
            ))}
          </div>
        </div>
      </Modal>
    </div>
  )
}
