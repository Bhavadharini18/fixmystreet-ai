import axios from 'axios'

const API_URL = 'http://localhost:8000'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth API
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  getLeaderboard: (limit = 10) => api.get(`/auth/leaderboard?limit=${limit}`),
  dashboard: () => api.get('/auth/dashboard'),
  getStreetFeed: () => api.get('/auth/street-feed')
}

// Reports API
export const reportsAPI = {
  create: (formData) => api.post('/report', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: (params) => api.get('/reports', { params }),
  getById: (id) => api.get(`/reports/${id}`),
  getMyReports: () => api.get('/reports/user/me'),
  getMapReports: () => api.get('/map/reports')
}

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  updateReport: (id, data) => api.put(`/admin/reports/${id}`, data),
  getReportsByPriority: (priority) => api.get(`/admin/reports/priority/${priority}`),
  getUsers: () => api.get('/admin/users'),
  deleteReport: (id) => api.delete(`/admin/reports/${id}`)
}

// Auth helpers
export const setToken = (token) => {
  localStorage.setItem('token', token)
}

export const getToken = () => {
  return localStorage.getItem('token')
}

export const removeToken = () => {
  localStorage.removeItem('token')
}

export const isAuthenticated = () => {
  return !!getToken()
}

export default api
