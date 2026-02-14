import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function LoginModal() {
  const { showLogin, setShowLogin, login, register } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [mode, setMode] = useState('login') // 'login' | 'register'

  if (!showLogin) return null

  async function submit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      let res
      if (mode === 'login') {
        res = await login({ email, password })
      } else {
        res = await register({ username, email, password })
      }
      if (!res.ok) {
        setError(res.body?.message || 'Auth failed')
      }
    } catch (err) {
      setError(err.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => setShowLogin(false)} />
      <form onSubmit={submit} className="relative bg-white rounded-2xl p-6 w-90 shadow-lg">
        <h3 className="mb-3 font-semibold text-deep-ocean">{mode === 'login' ? 'Login' : 'Create account'}</h3>
        {mode === 'register' && (
          <input className="input mb-2" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        )}
        <input className="input mb-2" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="input mb-4" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <div className="resp" style={{background:'rgba(255,40,40,0.06)', color:'#a00'}}>{error}</div>}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-slate-500">
            <button type="button" className="underline" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Create account' : 'Have an account?'}</button>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="button" onClick={() => setShowLogin(false)}>Cancel</button>
            <button className="button" type="submit" disabled={loading}>{loading ? 'Please wait...' : (mode === 'login' ? 'Login' : 'Create')}</button>
          </div>
        </div>
      </form>
    </div>
  )
}
