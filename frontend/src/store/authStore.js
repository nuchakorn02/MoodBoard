import { create } from 'zustand'
import { authService } from '../services/auth.service'

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await authService.login(credentials)
      localStorage.setItem('token', data.token)
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false })
    } catch (error) {
      set({ error: error.response?.data?.message || 'Login failed', isLoading: false })
      throw error
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await authService.register(userData)
      localStorage.setItem('token', data.token)
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false })
    } catch (error) {
      set({ error: error.response?.data?.message || 'Register failed', isLoading: false })
      throw error
    }
  },

  logout: async () => {
    try {
      await authService.logout()
    } finally {
      localStorage.removeItem('token')
      set({ user: null, token: null, isAuthenticated: false })
    }
  },

  fetchMe: async () => {
    set({ isLoading: true })
    try {
      const { data } = await authService.getMe()
      set({ user: data.user, isAuthenticated: true, isLoading: false })
    } catch {
      localStorage.removeItem('token')
      set({ user: null, token: null, isAuthenticated: false, isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))

export default useAuthStore
