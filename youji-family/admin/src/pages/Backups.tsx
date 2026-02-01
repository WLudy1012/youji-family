import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm, Tag, Progress } from 'antd'
import { PlusOutlined, DeleteOutlined, ReloadOutlined, DownloadOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { getBackups, createBackup, restoreBackup, deleteBackup } from '../services/api'

export default function Backups() {
  const [backups, setBackups] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    loadBackups()
  }, [])

  const loadBackups = async () => {
    try {
      setLoading(true)
      const res: any = await getBackups()
      setBackups(res.data || [])
    } catch (error) {
      message.error('加载备份失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBackup = async () => {
    try {
      const values = await form.validateFields()
      setCreating(true)
      await createBackup(values)
      message.success('备份创建成功')
      setModalVisible(false)
      loadBackups()
    } catch (error) {
      message.error('备份创建失败')
    } finally {
      setCreating(false)
    }
  }

  const handleRestoreBackup = async (id: number) => {
    try {
      setRestoring(true)
      await restoreBackup(id)
      message.success('备份恢复成功')
      loadBackups()
    } catch (error) {
      message.error('备份恢复失败')
    } finally {
      setRestoring(false)
    }
  }

  const handleDeleteBackup = async (id: number) => {
    try {
      await deleteBackup(id)
      message.success('备份删除成功')
      loadBackups()
    } catch (error) {
      message.error('备份删除失败')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockCircleOutlined className="text-orange-500" />;
      case 'completed':
        return <CheckCircleOutlined className="text-green-500" />;
      case 'failed':
        return <CloseCircleOutlined className="text-red-500" />;
      default:
        return null;
    }
  }

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'pending':
        return <Tag color="orange">备份中</Tag>;
      case 'completed':
        return <Tag color="green">已完成</Tag>;
      case 'failed':
        return <Tag color="red">失败</Tag>;
      default:
        return <Tag color="default">未知</Tag>;
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'backup_id', width: 60 },
    { title: '名称', dataIndex: 'backup_name' },
    { title: '类型', dataIndex: 'backup_type', width: 100, render: (v: string) => v === 'full' ? '完整备份' : '增量备份' },
    { title: '文件大小', dataIndex: 'file_size', width: 100, render: (v: number) => v ? `${(v / 1024 / 1024).toFixed(2)} MB` : '-' },
    { title: '状态', dataIndex: 'status', width: 100, render: (v: string) => getStatusTag(v) },
    { title: '创建时间', dataIndex: 'created_at', width: 180 },
    { title: '完成时间', dataIndex: 'completed_at', width: 180 },
    {
      title: '操作',
      width: 250,
      render: (_: any, record: any) => (
        <div>
          {record.status === 'completed' && (
            <>
              <Button type="link" icon={<DownloadOutlined />} onClick={() => message.info('下载功能开发中')}>下载</Button>
              <Popconfirm 
                title="确定恢复此备份？" 
                description="恢复备份将覆盖当前所有数据，请谨慎操作！" 
                onConfirm={() => handleRestoreBackup(record.backup_id)}
              >
                <Button type="link" icon={<ReloadOutlined />} onClick={() => {}}>恢复</Button>
              </Popconfirm>
            </>
          )}
          <Popconfirm title="确定删除此备份？" onConfirm={() => handleDeleteBackup(record.backup_id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </div>
      )
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>数据备份</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => setModalVisible(true)}
          disabled={creating}
        >
          创建备份
        </Button>
      </div>

      <Table
        rowKey="backup_id"
        columns={columns}
        dataSource={backups}
        loading={loading}
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: '暂无备份记录' }}
      />

      <Modal
        title="创建备份"
        open={modalVisible}
        onOk={handleCreateBackup}
        onCancel={() => setModalVisible(false)}
        confirmLoading={creating}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="backup_name" label="备份名称">
            <Input placeholder="例如：2024年1月备份" />
          </Form.Item>
          <Form.Item name="backup_type" label="备份类型" initialValue="full">
            <Select options={[
              { label: '完整备份', value: 'full' },
              { label: '增量备份', value: 'incremental' }
            ]} />
          </Form.Item>
          <div style={{ margin: '16px 0', padding: '12px', background: '#f5f5f5', borderRadius: 4 }}>
            <p style={{ margin: '0 0 8px 0' }}><strong>备份说明：</strong></p>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>完整备份：备份所有数据，文件较大但恢复速度快</li>
              <li>增量备份：仅备份新增和修改的数据，文件较小但恢复速度慢</li>
              <li>备份文件将保存在服务器的 backups 目录中</li>
              <li>建议定期创建完整备份，确保数据安全</li>
            </ul>
          </div>
        </Form>
      </Modal>

      {/* 恢复进度弹窗 */}
      {restoring && (
        <Modal
          title="恢复备份"
          open={restoring}
          footer={null}
          closable={false}
        >
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <ReloadOutlined className="spin" style={{ fontSize: 48, color: '#1e3a5f', marginBottom: 16 }} />
            <h3 style={{ marginBottom: 24 }}>正在恢复备份，请耐心等待...</h3>
            <Progress percent={60} status="active" />
            <p style={{ marginTop: 16, color: '#666' }}>预计需要 30-60 秒完成恢复</p>
          </div>
        </Modal>
      )}
    </div>
  )
}

// 添加旋转动画
const style = document.createElement('style')
style.textContent = `
  .spin {
    animation: spin 2s linear infinite;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`
document.head.appendChild(style)