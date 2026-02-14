import React from 'react'
import AppNavbar from './components/Navbar'
import Home from './routes/Home'

export default function App() {
  return (
    <div className="app">
      <AppNavbar />
      <header>
        <h1>Double — <small style={{fontWeight:500}}>Spot It!</small></h1>
        <p className="muted">Minimal client for local development (proxies <code>/api/*</code> → <code>http://localhost:5000</code>)</p>
      </header>
      <main>
        <Home />
      </main>
      <footer>
        <small>Client dev server: <code>http://localhost:3000</code> — Backend: <code>http://localhost:5000</code></small>
      </footer>
    </div>
  )
}
