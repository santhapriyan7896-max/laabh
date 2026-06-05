import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { nicheLabels, nicheCategories } from '../utils/categories'

export default function Signup() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    email: '', password: '',
    shopName: '', ownerName: '', phone: '', niche: ''
  })

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Create auth user
    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password
    })

    if (authError) { setError(authError.message); setLoading(false); return }

    const userId = data.user.id

    // Create profile
    await supabase.from('profiles').insert({
      id: userId,
      shop_name: form.shopName,
      owner_name: form.ownerName,
      phone: form.phone,
      niche: form.niche
    })

    // Insert default categories
    const niche = nicheCategories[form.niche]
    const cats = [
      ...niche.income.map(name => ({ user_id: userId, name, type: 'income' })),
      ...niche.expense.map(name => ({ user_id: userId, name, type: 'expense' }))
    ]
    await supabase.from('categories').insert(cats)

    setLoading(false)
    navigate('/')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px' }}>

      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#2563eb' }}>Laabh</h1>
        <p style={{ color: '#64748b', marginTop: '6px' }}>Create your free account</p>
      </div>

      <div className="card">
        {/* Step indicators */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {[1, 2].map(s => (
            <div key={s} style={{
              flex: 1, height: '4px', borderRadius: '4px',
              background: step >= s ? '#2563eb' : '#e2e8f0'
            }} />
          ))}
        </div>

        <form onSubmit={handleSignup}>
          {step === 1 && (
            <>
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Account Details</h2>

              <div className="form-group">
                <label className="label">Email</label>
                <input type="email" placeholder="you@email.com"
                  value={form.email} onChange={e => update('email', e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="label">Password</label>
                <input type="password" placeholder="Min 6 characters"
                  value={form.password} onChange={e => update('password', e.target.value)} required minLength={6} />
              </div>

              <button type="button" className="btn-primary"
                onClick={() => { if (form.email && form.password.length >= 6) setStep(2) }}>
                Next →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Shop Details</h2>

              <div className="form-group">
                <label className="label">Shop Name</label>
                <input type="text" placeholder="e.g. Murugan Stores"
                  value={form.shopName} onChange={e => update('shopName', e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="label">Your Name</label>
                <input type="text" placeholder="Owner name"
                  value={form.ownerName} onChange={e => update('ownerName', e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="label">Phone Number</label>
                <input type="tel" placeholder="9876543210"
                  value={form.phone} onChange={e => update('phone', e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="label">Business Type</label>
                <select value={form.niche} onChange={e => update('niche', e.target.value)} required>
                  <option value="">Select your business</option>
                  {Object.entries(nicheLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {error && <p style={{ color: '#dc2626', fontSize: '14px', marginBottom: '12px' }}>{error}</p>}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="btn-outline" style={{ width: 'auto', padding: '14px 20px' }}
                  onClick={() => setStep(1)}>← Back</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </>
          )}
        </form>

        <p style={{ textAlign: 'center', marginTop: '16px', color: '#64748b', fontSize: '14px' }}>
          Already have account?{' '}
          <Link to="/login" style={{ color: '#2563eb', fontWeight: '600' }}>Login</Link>
        </p>
      </div>
    </div>
  )
}