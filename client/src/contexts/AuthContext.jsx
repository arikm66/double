import React, { createContext, useContext, useEffect, useState } from 'react'
import * as authService from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getStoredUser())
  const [ready, setReady] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    // if there's a token but no user in state, try to fetch current user
    async function init() {
      const token = authService.getToken()
      if (token && !user) {
        const res = await authService.fetchCurrentUser()
        if (res.ok && res.body?.user) {
          authService.setStoredUser(res.body.user)
          setUser(res.body.user)
        } else {
          authService.logout()
          setUser(null)
        }
      }
      setReady(true)
    }
    init()
  }, [])

  const login = async (credentials) => {
    const res = await authService.login(credentials)
    if (res.ok) {
      setUser(res.body.user)
      setShowLogin(false)
    }
    return res
  }

  const register = async (payload) => {
    const res = await authService.register(payload)
    if (res.ok) {
      setUser(res.body.user)
      setShowLogin(false)
    }
    return res
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, logout, register, showLogin, setShowLogin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
