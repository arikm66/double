import React from 'react'
import AppNavbar from './components/Navbar'
import Home from './components/Home'
import LoginModal from './components/LoginModal'
import Footer from './components/Footer'
import LibraryManagement from './components/LibraryManagement/LibraryManagement'
import AdminPanel from './components/AdminPanel/AdminPanel'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

export default function App() {
  return (
    <BrowserRouter>
      <AppNavbar />
      <LoginModal />

      <main className="w-full min-h-screen px-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lib-mgmt" element={<LibraryManagement />} />
          <Route path="/admin-panel" element={<AdminPanel />} />
        </Routes>
      </main>

      <Footer />
    </BrowserRouter>
  )
}
