import { request } from './api'

const TOKEN_KEY = 'double_token'
const USER_KEY = 'double_user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export function setStoredUser(user) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  else localStorage.removeItem(USER_KEY)
}

export async function login({ email, password }) {
  const res = await request({ path: '/api/auth/login', method: 'POST', body: { email, password } })
  if (res.ok && res.body?.token) {
    setToken(res.body.token)
    setStoredUser(res.body.user || null)
  }
  return res
}

export async function register({ username, email, password }) {
  const res = await request({ path: '/api/auth/register', method: 'POST', body: { username, email, password } })
  if (res.ok && res.body?.token) {
    setToken(res.body.token)
    setStoredUser(res.body.user || null)
  }
  return res
}

export async function fetchCurrentUser() {
  return request({ path: '/api/auth/me', method: 'GET' })
}

export function logout() {
  setToken(null)
  setStoredUser(null)
}
