import React from 'react'
import Home from './routes/Home'

export default function App() {
  return (
    <div className="app">
      <header>
        <h1>Double Newer — Client</h1>
        <p className="muted">Minimal client for local development (talks to localhost:5000)</p>
      </header>
      <main>
        <Home />
      </main>
      <footer>
        <small>Requests to <code>/api/*</code> are proxied to <code>http://localhost:5000</code></small>
      </footer>
    </div>
  )
}
