import api from './api'

export const moodService = {
  getAll: (params) => api.get('/moods', { params }),
  getById: (id) => api.get(`/moods/${id}`),
  create: (data) => api.post('/moods', data),
  update: (id, data) => api.put(`/moods/${id}`, data),
  remove: (id) => api.delete(`/moods/${id}`),
}
