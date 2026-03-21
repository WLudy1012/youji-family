import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App'
import './index.css'
import {
  ADMIN_THEME_EVENT,
  bootstrapTheme,
  getCurrentTheme,
  type ThemePalette
} from './theme/themeManager'

const hexToRgba = (hex: string, alpha: number) => {
  const value = hex.replace('#', '')
  const normalized = value.length === 3
    ? value.split('').map((char) => `${char}${char}`).join('')
    : value

  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

bootstrapTheme()

function Root() {
  const [theme, setTheme] = useState<ThemePalette>(() => getCurrentTheme())

  useEffect(() => {
    const handleThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<ThemePalette>
      if (customEvent.detail) {
        setTheme(customEvent.detail)
      }
    }

    window.addEventListener(ADMIN_THEME_EVENT, handleThemeChange)
    return () => window.removeEventListener(ADMIN_THEME_EVENT, handleThemeChange)
  }, [])

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: theme.primary,
          colorInfo: theme.primary,
          colorSuccess: theme.secondary,
          colorWarning: theme.accent,
          colorError: '#ff7875',
          colorBgBase: theme.background,
          colorTextBase: theme.text,
          colorBorder: hexToRgba(theme.secondary, 0.18),
          controlOutline: hexToRgba(theme.primary, 0.18),
          controlItemBgActive: hexToRgba(theme.primary, 0.12),
          borderRadius: 10
        },
        components: {
          Input: {
            activeBorderColor: theme.primary,
            hoverBorderColor: theme.primary,
            activeShadow: `0 0 0 2px ${hexToRgba(theme.primary, 0.15)}`
          },
          Menu: {
            itemBg: 'transparent',
            itemColor: theme.text,
            itemHoverBg: hexToRgba(theme.primary, 0.08),
            itemHoverColor: theme.primary,
            itemSelectedBg: hexToRgba(theme.primary, 0.14),
            itemSelectedColor: theme.primary,
            itemActiveBg: hexToRgba(theme.primary, 0.12)
          }
        }
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
