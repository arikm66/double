import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '20px'
      }}>
        Loading...
      </div>
    )
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to="/dashboard" /> : <Register />} 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  )
}

export default App
