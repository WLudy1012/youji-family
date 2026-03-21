import { useEffect, useState } from 'react'
import { Form, Input, Button, message, Card, Tabs, Spin, ColorPicker, Segmented, Space, Typography } from 'antd'
import type { Color } from 'antd/es/color-picker'
import api from '../services/api'
import { applyTheme, buildTheme, clearThemeMemory, getPresetPalette, rememberTheme, ThemeMode } from '../theme/themeManager'

interface ThemeDraft {
  mode: ThemeMode
  primary: string
  secondary: string
}

const presetOptions = [
  { label: '海雾蓝', value: 'ocean' },
  { label: '松石绿', value: 'emerald' },
  { label: '暮光橙', value: 'sunset' }
]

const presetDescriptions: Record<ThemeMode, string> = {
  ocean: '冷静、清透，适合内容密集和长时间浏览。',
  emerald: '自然、温和，适合成员信息和资料管理场景。',
  sunset: '温暖、醒目，适合需要更强视觉层次的后台界面。'
}

const colorToHex = (color: string | Color) => {
  if (typeof color === 'string') return color
  return color.toHexString()
}

export default function Settings() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [themeDraft, setThemeDraft] = useState<ThemeDraft>(() => {
    const initial = buildTheme()
    return { mode: initial.mode, primary: initial.primary, secondary: initial.secondary }
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const syncTheme = (next: ThemeDraft, persist = true) => {
    setThemeDraft(next)
    applyTheme({
      mode: next.mode,
      primary: next.primary,
      secondary: next.secondary,
      accent: getPresetPalette(next.mode).accent,
      background: getPresetPalette(next.mode).background,
      text: getPresetPalette(next.mode).text
    })

    if (persist) {
      rememberTheme(next)
    }
  }

  const loadSettings = async () => {
    try {
      setLoading(true)
      const res: any = await api.get('/api/admin/configs')
      if (res.data.success) {
        form.setFieldsValue(res.data.data)

        const merged = buildTheme({
          theme_primary_color: res.data.data.theme_primary_color,
          theme_secondary_color: res.data.data.theme_secondary_color
        })

        syncTheme(
          {
            mode: merged.mode,
            primary: merged.primary,
            secondary: merged.secondary
          },
          false
        )
      }
    } catch (error) {
      message.error('加载配置失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const values = await form.validateFields()
      await api.put('/api/admin/configs', {
        ...values,
        theme_primary_color: themeDraft.primary,
        theme_secondary_color: themeDraft.secondary
      })
      message.success('保存成功')
    } catch (error) {
      message.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleModeChange = (mode: ThemeMode) => {
    const preset = getPresetPalette(mode)
    syncTheme({
      mode,
      primary: preset.primary,
      secondary: preset.secondary
    })
  }

  const items = [
    {
      key: 'basic',
      label: '基本设置',
      children: (
        <Form form={form} layout="vertical">
          <Form.Item name="site_name" label="站点名称" rules={[{ required: true }]}>
            <Input placeholder="由基家族" />
          </Form.Item>
          <Form.Item name="site_description" label="站点描述">
            <Input.TextArea rows={2} placeholder="站点描述，用于 SEO" />
          </Form.Item>
          <Form.Item name="site_keywords" label="SEO 关键词">
            <Input placeholder="关键词1, 关键词2, 关键词3" />
          </Form.Item>
          <Form.Item name="site_logo" label="站点 Logo">
            <Input placeholder="/uploads/logo.png" />
          </Form.Item>
        </Form>
      )
    },
    {
      key: 'theme',
      label: '主题设置',
      children: (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Typography.Text type="secondary">
            主题支持实时预览。当前选择会优先保存在本地，保存设置后会同步写入系统配置，刷新后仍可保持一致。
          </Typography.Text>

          <div>
            <Typography.Text strong>主题预设</Typography.Text>
            <div style={{ marginTop: 10 }}>
              <Segmented
                value={themeDraft.mode}
                onChange={(value) => handleModeChange(value as ThemeMode)}
                options={presetOptions}
              />
            </div>
            <Typography.Paragraph type="secondary" style={{ marginTop: 10, marginBottom: 0 }}>
              {presetDescriptions[themeDraft.mode]}
            </Typography.Paragraph>
          </div>

          <Space wrap>
            <div>
              <Typography.Text strong>主色</Typography.Text>
              <div style={{ marginTop: 10 }}>
                <ColorPicker
                  value={themeDraft.primary}
                  onChange={(value) => syncTheme({ ...themeDraft, primary: colorToHex(value) })}
                  showText
                />
              </div>
            </div>
            <div>
              <Typography.Text strong>辅色</Typography.Text>
              <div style={{ marginTop: 10 }}>
                <ColorPicker
                  value={themeDraft.secondary}
                  onChange={(value) => syncTheme({ ...themeDraft, secondary: colorToHex(value) })}
                  showText
                />
              </div>
            </div>
            <Button
              onClick={() => {
                clearThemeMemory()
                const merged = buildTheme(form.getFieldsValue())
                syncTheme({ mode: merged.mode, primary: merged.primary, secondary: merged.secondary }, false)
                message.success('已清除本地主题记忆')
              }}
            >
              清除本地记忆
            </Button>
          </Space>
        </Space>
      )
    },
    {
      key: 'home',
      label: '首页设置',
      children: (
        <Form form={form} layout="vertical">
          <Form.Item name="home_banner_title" label="首页横幅标题">
            <Input placeholder="由基家族" />
          </Form.Item>
          <Form.Item name="home_banner_subtitle" label="首页横幅副标题">
            <Input placeholder="世代传承，薪火相继" />
          </Form.Item>
          <Form.Item name="family_declaration" label="家族宣言">
            <Input.TextArea rows={2} placeholder="传承家族文化，凝聚家族力量" />
          </Form.Item>
        </Form>
      )
    },
    {
      key: 'contact',
      label: '联系信息',
      children: (
        <Form form={form} layout="vertical">
          <Form.Item name="contact_email" label="联系邮箱">
            <Input placeholder="contact@youji-family.com" />
          </Form.Item>
          <Form.Item name="contact_phone" label="联系电话">
            <Input placeholder="13800138000" />
          </Form.Item>
          <Form.Item name="icp_number" label="ICP 备案号">
            <Input placeholder="京 ICP 备 XXXXXXX 号" />
          </Form.Item>
        </Form>
      )
    },
    {
      key: 'footer',
      label: '页脚设置',
      children: (
        <Form form={form} layout="vertical">
          <Form.Item name="footer_copyright" label="版权信息">
            <Input placeholder="© 2024 由基家族 版权所有" />
          </Form.Item>
        </Form>
      )
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>系统设置</h2>
        <Button type="primary" loading={saving} onClick={handleSave}>
          保存设置
        </Button>
      </div>

      <Card>
        <Spin spinning={loading}>
          <Tabs items={items} />
        </Spin>
      </Card>

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Button type="primary" size="large" loading={saving} onClick={handleSave}>
          保存所有设置
        </Button>
      </div>
    </div>
  )
}
