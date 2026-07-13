import api from './api'

export const statisticsService = {
  getStatistics: () => api.get('/statistics'),
}
