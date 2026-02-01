/**
 * 管理后台API服务
 * 封装所有后端API调用
 */

import axios from 'axios'

// API基础URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      // 未授权，清除token
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ==================== 认证API ====================
export const adminLogin = (data: any) => api.post('/auth/admin/login', data)

// ==================== 成员API ====================
export const getMembers = (params?: any) => api.get('/members', { params })
export const getMember = (id: number | string) => api.get(`/members/${id}`)
export const createMember = (data: any) => api.post('/admin/members', data)
export const updateMember = (id: number | string, data: any) => api.put(`/admin/members/${id}`, data)
export const deleteMember = (id: number | string) => api.delete(`/admin/members/${id}`)
export const createMemberAccount = (memberId: number | string, data: any) => api.post(`/admin/members/${memberId}/account`, data)

// ==================== 文章API ====================
export const getArticles = (params?: any) => api.get('/articles', { params })
export const getArticle = (id: number | string) => api.get(`/articles/${id}`)
export const createArticle = (data: any) => api.post('/admin/articles', data)
export const updateArticle = (id: number | string, data: any) => api.put(`/admin/articles/${id}`, data)
export const deleteArticle = (id: number | string) => api.delete(`/admin/articles/${id}`)

// ==================== 公告API ====================
export const getAnnouncements = (params?: any) => api.get('/announcements', { params })
export const getAnnouncement = (id: number | string) => api.get(`/announcements/${id}`)
export const createAnnouncement = (data: any) => api.post('/admin/announcements', data)
export const updateAnnouncement = (id: number | string, data: any) => api.put(`/admin/announcements/${id}`, data)
export const deleteAnnouncement = (id: number | string) => api.delete(`/admin/announcements/${id}`)

// ==================== 相册API ====================
export const getAlbums = (params?: any) => api.get('/albums', { params })
export const getAlbum = (id: number | string) => api.get(`/albums/${id}`)
export const createAlbum = (data: any) => api.post('/admin/albums', data)
export const updateAlbum = (id: number | string, data: any) => api.put(`/admin/albums/${id}`, data)
export const deleteAlbum = (id: number | string) => api.delete(`/admin/albums/${id}`)

// ==================== 留言API ====================
export const getGuestbook = (params?: any) => api.get('/guestbook', { params })
export const updateGuestbookStatus = (id: number | string, data: any) => api.put(`/admin/guestbook/${id}/status`, data)

// ==================== 配置API ====================
export const getConfigs = () => api.get('/configs')
export const updateConfig = (data: any) => api.put('/admin/configs', data)

// ==================== 上传API ====================
export const uploadImage = (data: FormData) => api.post('/upload/image', data, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})

// ==================== 备份API ====================
export const getBackups = () => api.get('/admin/backups')
export const createBackup = (data: any) => api.post('/admin/backups', data)
export const restoreBackup = (id: number | string) => api.post(`/admin/backups/${id}/restore`)
export const deleteBackup = (id: number | string) => api.delete(`/admin/backups/${id}`)

export default api