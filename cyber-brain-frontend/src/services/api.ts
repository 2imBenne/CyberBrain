import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"

const ACCESS_TOKEN_KEY = "cb_access_token"
const REFRESH_TOKEN_KEY = "cb_refresh_token"

/** Quản lý JWT trong localStorage (Phase 2 sẽ chuyển vào authStore Zustand) */
export const tokenStore = {
  get access(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },
  get refresh(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },
  set(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  },
  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080/api",
  timeout: 15_000,
})

// Gắn Access Token vào mọi request
api.interceptors.request.use((config) => {
  const token = tokenStore.access
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean }

// Chỉ cho phép 1 lần refresh song song, các request 401 khác chờ dùng lại kết quả
let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStore.refresh
  if (!refreshToken) return null

  try {
    const { data } = await axios.post<{
      data?: { accessToken?: string; refreshToken?: string }
      accessToken?: string
      refreshToken?: string
    }>(`${api.defaults.baseURL}/auth/refresh`, { refreshToken })

    const accessToken = data.data?.accessToken ?? data.accessToken
    if (!accessToken) return null

    tokenStore.set(accessToken, data.data?.refreshToken ?? data.refreshToken ?? refreshToken)
    return accessToken
  } catch {
    return null
  }
}

// Tự động refresh khi 401 rồi retry request gốc; thất bại thì logout
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined
    const isAuthEndpoint = original?.url?.includes("/auth/") ?? false

    if (error.response?.status === 401 && original && !original._retry && !isAuthEndpoint) {
      original._retry = true

      refreshPromise = refreshPromise ?? refreshAccessToken()
      const accessToken = await refreshPromise
      refreshPromise = null

      if (accessToken) {
        original.headers.Authorization = `Bearer ${accessToken}`
        return api(original)
      }

      tokenStore.clear()
      window.dispatchEvent(new CustomEvent("cb:unauthorized"))
    }

    return Promise.reject(error)
  },
)
