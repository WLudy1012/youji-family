import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#6f8fbc',
          colorInfo: '#6f8fbc',
          colorSuccess: '#6bbf9d',
          colorWarning: '#dfc07a',
          colorError: '#ff7875',
          colorBgBase: '#e7edf6',
          colorTextBase: '#2b3b52',
          borderRadius: 10
        }
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>,
)
