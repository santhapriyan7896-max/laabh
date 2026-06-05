import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { nicheLabels } from '../utils/categories'

export default function Settings({ profile, onProfileUpdate }) {
  const [tab, setTab] = useState('profile')
  const [profileForm, setProfileForm] = useState({ shop_name: '', owner_name: '', phone: '', niche: '' })
  const [categories, setCategories] = useState([])
  const [showCatForm, setShowCatForm] = useState(false)
  const [editCat, setEditCat] = useState(null)
  const [catForm, setCatForm] = useState({ name: '', type: 'income' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (profile) {
      setProfileForm({
        shop_name: profile.shop_name || '',
        owner_name: profile.owner_name || '',
        phone: profile.phone || '',
        niche: profile.niche || ''
      })
      fetchCategories()
    }
  }, [profile])

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories').select('*')
      .eq('user_id', profile.id)
      .order('type').order('name')
    setCategories(data || [])
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    await supabase.from('profiles').update(profileForm).eq('id', profile.id)
    onProfileUpdate(profileForm)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSaveCategory = async (e) => {
    e.preventDefault()
    if (editCat) {
      await supabase.from('categories').update({ name: catForm.name }).eq('id', editCat.id)
    } else {
      await supabase.from('categories').insert({ user_id: profile.id, name: catForm.name, type: catForm.type })
    }
    setCatForm({ name: '', type: 'income' })
    setShowCatForm(false)
    setEditCat(null)
    fetchCategories()
  }

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return
    await supabase.from('categories').delete().eq('id', id)
    fetchCategories()
  }

  const catForm_jsx = showCatForm ? (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', zIndex: 200 }}>
      <div style={{ background: 'white', width: '100%', maxWidth: '480px', margin: '0 auto', borderRadius: '20px 20px 0 0', padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>
          {editCat ? 'Edit Category' : 'Add Category'}
        </h3>
        <form onSubmit={handleSaveCategory}>
          {!editCat && (
            <div className="form-group">
              <label className="label">Type</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['income', 'expense'].map(t => (
                  <button key={t} type="button" onClick={() => setCatForm(p => ({ ...p, type: t }))}
                    style={{
                      flex: 1, padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: '600',
                      background: catForm.type === t ? (t === 'income' ? '#16a34a' : '#dc2626') : '#f1f5f9',
                      color: catForm.type === t ? 'white' : '#64748b'
                    }}>
                    {t === 'income' ? 'Income' : 'Expense'}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="form-group">
            <label className="label">Category Name</label>
            <input type="text" placeholder="e.g. Veterinary"
              value={catForm.name} onChange={e => setCatForm(p => ({ ...p, name: e.target.value }))} required />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="btn-outline" style={{ width: 'auto', padding: '14px 20px' }}
              onClick={() => { setShowCatForm(false); setEditCat(null) }}>Cancel</button>
            <button type="submit" className="btn-primary">
              {editCat ? 'Save Changes' : 'Add Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null

  const incomeCategories = categories.filter(c => c.type === 'income')
  const expenseCategories = categories.filter(c => c.type === 'expense')

  return (
    <div className="page">
      <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>Settings</h2>

      {/* Tab switcher */}
      <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '10px', padding: '4px', marginBottom: '20px' }}>
        {['profile', 'categories'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '10px', borderRadius: '8px', fontSize: '14px',
            background: tab === t ? 'white' : 'transparent',
            color: tab === t ? '#2563eb' : '#64748b',
            boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            fontWeight: tab === t ? '700' : '500'
          }}>{t === 'profile' ? 'Shop Profile' : 'Categories'}</button>
        ))}
      </div>

      {tab === 'profile' && (
        <form onSubmit={handleSaveProfile}>
          <div className="form-group">
            <label className="label">Shop Name</label>
            <input type="text" value={profileForm.shop_name}
              onChange={e => setProfileForm(p => ({ ...p, shop_name: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="label">Owner Name</label>
            <input type="text" value={profileForm.owner_name}
              onChange={e => setProfileForm(p => ({ ...p, owner_name: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="label">Phone Number</label>
            <input type="tel" value={profileForm.phone}
              onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="label">Business Type</label>
            <select value={profileForm.niche} onChange={e => setProfileForm(p => ({ ...p, niche: e.target.value }))} required>
              {Object.entries(nicheLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-primary" disabled={saving}>
            {saved ? '✅ Saved!' : saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      )}

      {tab === 'categories' && (
        <>
          {catForm_jsx}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button onClick={() => { setEditCat(null); setCatForm({ name: '', type: 'income' }); setShowCatForm(true) }}
              className="btn-primary" style={{ width: 'auto', padding: '10px 16px', fontSize: '14px' }}>
              + Add Category
            </button>
          </div>

          {/* Income categories */}
          <h4 style={{ color: '#16a34a', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>INCOME</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            {incomeCategories.map(cat => (
              <div key={cat.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontWeight: '600' }}>{cat.name}</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => { setEditCat(cat); setCatForm({ name: cat.name, type: cat.type }); setShowCatForm(true) }}
                    style={{ width: 'auto', padding: '6px 10px', background: '#f1f5f9', color: '#475569', fontSize: '13px', borderRadius: '8px' }}>✏️</button>
                  <button onClick={() => handleDeleteCategory(cat.id)}
                    style={{ width: 'auto', padding: '6px 10px', background: '#fee2e2', color: '#dc2626', fontSize: '13px', borderRadius: '8px' }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>

          {/* Expense categories */}
          <h4 style={{ color: '#dc2626', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>EXPENSE</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {expenseCategories.map(cat => (
              <div key={cat.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontWeight: '600' }}>{cat.name}</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => { setEditCat(cat); setCatForm({ name: cat.name, type: cat.type }); setShowCatForm(true) }}
                    style={{ width: 'auto', padding: '6px 10px', background: '#f1f5f9', color: '#475569', fontSize: '13px', borderRadius: '8px' }}>✏️</button>
                  <button onClick={() => handleDeleteCategory(cat.id)}
                    style={{ width: 'auto', padding: '6px 10px', background: '#fee2e2', color: '#dc2626', fontSize: '13px', borderRadius: '8px' }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}