import React, { useState } from 'react'
import { request } from '../services/api'

export default function Home() {
  const [path, setPath] = useState('http://localhost:5000/')
  const [method, setMethod] = useState('GET')
  const [rawBody, setRawBody] = useState('')
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function send() {
    setLoading(true)
    setError(null)
    setResponse(null)
    let body = null
    if (rawBody) {
      try { body = JSON.parse(rawBody) } catch (err) { setError('Invalid JSON in request body'); setLoading(false); return }
    }

    try {
      const res = await request({ path, method, body })
      setResponse(res)
    } catch (err) {
      setError(err.message || String(err))
    } finally { setLoading(false) }
  }

  return (
    <div className="card">
      <div className="form-row">
        <input className="input" value={path} onChange={e => setPath(e.target.value)} placeholder="Full URL or relative path (e.g. /api/packs)" />
        <select value={method} onChange={e => setMethod(e.target.value)}>
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>PATCH</option>
          <option>DELETE</option>
        </select>
        <button className="button" onClick={send} disabled={loading}>{loading ? 'Sending...' : 'Send'}</button>
      </div>

      <div style={{marginBottom:8}}>
        <label style={{color:'#9aa4b2',fontSize:13}}>Request body (JSON)</label>
        <textarea value={rawBody} onChange={e => setRawBody(e.target.value)} placeholder='{"name":"foo"}' />
      </div>

      {error && <div className="resp" style={{background:'rgba(255,40,40,0.08)',color:'#ffb3b3'}}>{error}</div>}

      {response && (
        <div>
          <div className="resp">
            <strong>HTTP {response.status}</strong>
            <div style={{marginTop:8}}>{typeof response.body === 'object' ? JSON.stringify(response.body, null, 2) : String(response.body)}</div>
          </div>
        </div>
      )}

      <div className="footer">Tip: use a relative path starting with <code>/api/</code> to go through the dev proxy to <code>http://localhost:5000</code></div>
    </div>
  )
}
