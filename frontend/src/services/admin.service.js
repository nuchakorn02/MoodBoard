import api from './api'

export const adminService = {
  getUsers: () => api.get('/admin/users'),
  deleteMood: (id) => api.delete(`/admin/moods/${id}`),
}
