import React from 'react'
import AppNavbar from './components/Navbar'
import Home from './routes/Home'
import LoginModal from './components/LoginModal'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <AppNavbar />
      <LoginModal />
      <div className="app">
        <main>
          <Home />
        </main>
      </div>
      <Footer />
    </>
  )
}
