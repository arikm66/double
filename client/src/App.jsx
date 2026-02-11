import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import Manage from './components/Manage'
import Play from './components/Play'
import DataManagement from './components/DataManagement/DataManagement'
import UserManagement from './components/UserManagement'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import UtilsManagement from './components/UtilsManagement/UtilsManagement'
import PacksList from './components/PacksManagement/PacksList';
import PackEdit from './components/PacksManagement/PackEdit';
import PackCreate from './components/PacksManagement/PackCreate';
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
      <Route 
        path="/manage" 
        element={
          <ProtectedRoute>
            <Manage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/play" 
        element={
          <ProtectedRoute>
            <Play />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/data-management" 
        element={
          <ProtectedRoute>
            <DataManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/user-management" 
        element={
          <AdminRoute>
            <UserManagement />
          </AdminRoute>
        } 
      />
      <Route 
        path="/utils" 
        element={
          <AdminRoute>
            <UtilsManagement />
          </AdminRoute>
        } 
      />
      <Route 
        path="/packs" 
        element={<PacksList />} 
      />
      <Route
        path="/packs/create"
        element={<PackCreate />}
      />
      <Route
        path="/packs/:id/edit"
        element={<PackEdit />}
      />
    </Routes>
  )
}

export default App
