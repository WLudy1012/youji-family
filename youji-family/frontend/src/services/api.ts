/**
 * API服务
 * 封装所有后端API调用
 */

import axios from 'axios'

// API基础URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

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
    const token = localStorage.getItem('token')
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
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ==================== 配置API ====================
export const getConfigs = () => api.get('/configs')

// ==================== 成员API ====================
export const getMembers = (params?: any) => api.get('/members', { params })
export const getMember = (id: number | string) => api.get(`/members/${id}`)
export const getFamilyTree = () => api.get('/members/tree')

// ==================== 文章API ====================
export const getArticles = (params?: any) => api.get('/articles', { params })
export const getArticle = (id: number | string) => api.get(`/articles/${id}`)

// ==================== 公告API ====================
export const getAnnouncements = (params?: any) => api.get('/announcements', { params })
export const getAnnouncement = (id: number | string) => api.get(`/announcements/${id}`)

// ==================== 相册API ====================
export const getAlbums = (params?: any) => api.get('/albums', { params })
export const getAlbum = (id: number | string) => api.get(`/albums/${id}`)

// ==================== 留言API ====================
export const getGuestbook = (params?: any) => api.get('/guestbook', { params })
export const createMessage = (data: any) => api.post('/guestbook', data)

export default api
