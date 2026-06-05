import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function AdminRoute() {
  const { user, loading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(null)

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('is_admin').eq('id', user.id).single()
        .then(({ data }) => setIsAdmin(data?.is_admin || false))
    }
  }, [user])

  if (loading || isAdmin === null) return <p style={{ padding: '24px' }}>Loading...</p>
  if (!user) return <Navigate to="/login" />
  if (!isAdmin) return <Navigate to="/" />

  return <Admin onExit={() => window.location.href = '/'} />
}

function App() {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Loading...</p>
    </div>
  )

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
        <Route path="/hbk-admin-9x7" element={<AdminRoute />} />
        <Route path="/*" element={user ? <Dashboard /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App