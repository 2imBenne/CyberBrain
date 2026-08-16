import { create } from 'zustand'

import { api, tokenStore } from '@/services/api'
import type { ApiResponse, AuthResponse, User } from '@/types'

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'guest'

interface AuthState {
  user: User | null
  status: AuthStatus
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  clearLocal: () => void
  bootstrap: () => Promise<void>
}

function applyAuth(data: AuthResponse) {
  tokenStore.set(data.accessToken, data.refreshToken)
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  status: 'idle',

  login: async (username, password) => {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', { username, password })
    applyAuth(data.data)
    set({ user: data.data.user, status: 'authenticated' })
  },

  register: async (username, email, password) => {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register', {
      username,
      email,
      password,
    })
    applyAuth(data.data)
    set({ user: data.data.user, status: 'authenticated' })
  },

  logout: async () => {
    try {
      await api.post('/auth/logout', { refreshToken: tokenStore.refresh })
    } catch {
      // logout best-effort: kể cả fail cũng clear local
    }
    tokenStore.clear()
    set({ user: null, status: 'guest' })
  },

  clearLocal: () => {
    tokenStore.clear()
    set({ user: null, status: 'guest' })
  },

  bootstrap: async () => {
    if (!tokenStore.access) {
      set({ status: 'guest', user: null })
      return
    }
    set({ status: 'loading' })
    try {
      const { data } = await api.get<ApiResponse<User>>('/users/me')
      set({ user: data.data, status: 'authenticated' })
    } catch {
      tokenStore.clear()
      set({ user: null, status: 'guest' })
    }
  },
}))
