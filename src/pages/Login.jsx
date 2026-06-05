import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
  e.preventDefault()
  setLoading(true)
  setError('')

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    setError(error.message)
  } else {
    navigate('/')
  }
  setLoading(false)
}

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#2563eb' }}>Laabh</h1>
        <p style={{ color: '#64748b', marginTop: '6px' }}>Smart accounts for your shop</p>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Login</h2>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="label">Email</label>
            <input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p style={{ color: '#dc2626', fontSize: '14px', marginBottom: '12px' }}>{error}</p>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '16px', color: '#64748b', fontSize: '14px' }}>
          No account?{' '}
          <Link to="/signup" style={{ color: '#2563eb', fontWeight: '600' }}>Sign up free</Link>
        </p>
      </div>
    </div>
  )
}