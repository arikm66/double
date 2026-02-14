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
      {/* Home is full-width and should sit outside the centered .app container */}
      <Home />

      <div className="app">
        <main>
          {/* other centered content (if any) can remain here */}
        </main>
      </div>

      <Footer />
    </>
  )
}
