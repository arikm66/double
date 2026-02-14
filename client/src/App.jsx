import React from 'react'
import AppNavbar from './components/Navbar'
import Home from './routes/Home'
import LoginModal from './components/LoginModal'
import Footer from './components/Footer'
import WordPacks from './components/WordPacks'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

export default function App() {
  return (
    <BrowserRouter>
      <AppNavbar />
      <LoginModal />

      <main className="w-full min-h-screen px-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/word-packs" element={<WordPacks />} />
        </Routes>
      </main>

      <Footer />
    </BrowserRouter>
  )
}
