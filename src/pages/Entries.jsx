import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { format } from 'date-fns'

export default function Entries({ profile }) {
  const [entries, setEntries] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editEntry, setEditEntry] = useState(null)
  const [activeType, setActiveType] = useState('income')
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  const [form, setForm] = useState({ category_id: '', amount: '', note: '', date: format(new Date(), 'yyyy-MM-dd'), type: 'income' })

  useEffect(() => { if (profile) { fetchEntries(); fetchCategories() } }, [profile, selectedDate])

  const fetchEntries = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('entries')
      .select('*, categories(name)')
      .eq('user_id', profile.id)
      .eq('date', selectedDate)
      .order('created_at', { ascending: false })
    setEntries(data || [])
    setLoading(false)
  }

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', profile.id)
      .order('name')
    setCategories(data || [])
  }

  const openAdd = (type) => {
    setEditEntry(null)
    setForm({ category_id: '', amount: '', note: '', date: selectedDate, type })
    setActiveType(type)
    setShowForm(true)
  }

  const openEdit = (entry) => {
    setEditEntry(entry)
    setForm({
      category_id: entry.category_id,
      amount: String(entry.amount),
      note: entry.note || '',
      date: entry.date,
      type: entry.type
    })
    setActiveType(entry.type)
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const payload = {
      user_id: profile.id,
      category_id: form.category_id,
      amount: parseFloat(form.amount),
      note: form.note,
      date: form.date,
      type: form.type
    }

    if (editEntry) {
      await supabase.from('entries').update(payload).eq('id', editEntry.id)
    } else {
      await supabase.from('entries').insert(payload)
    }

    setShowForm(false)
    fetchEntries()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry?')) return
    await supabase.from('entries').delete().eq('id', id)
    fetchEntries()
  }

  const filteredCats = categories.filter(c => c.type === form.type)
  const incomeEntries = entries.filter(e => e.type === 'income')
  const expenseEntries = entries.filter(e => e.type === 'expense')

  return (
    <div className="page">

      {/* Date picker */}
      <div className="form-group">
        <label className="label">Date</label>
        <input type="date" value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)} />
      </div>

      {/* Add buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button className="btn-success" onClick={() => openAdd('income')}
          style={{ fontSize: '14px', padding: '12px' }}>
          + Add Income
        </button>
        <button className="btn-danger" onClick={() => openAdd('expense')}
          style={{ fontSize: '14px', padding: '12px' }}>
          + Add Expense
        </button>
      </div>

      {/* Entry form modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'flex-end', zIndex: 200
        }}>
          <div style={{
            background: 'white', width: '100%', maxWidth: '480px',
            margin: '0 auto', borderRadius: '20px 20px 0 0', padding: '24px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>
              {editEntry ? 'Edit Entry' : `Add ${form.type === 'income' ? 'Income' : 'Expense'}`}
            </h3>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="label">Category</label>
                <select value={form.category_id}
                  onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))} required>
                  <option value="">Select category</option>
                  {filteredCats.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label">Amount (₹)</label>
                <input type="number" placeholder="0" min="1"
                  value={form.amount}
                  onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required />
              </div>

              <div className="form-group">
                <label className="label">Note (optional)</label>
                <input type="text" placeholder="Add a note..."
                  value={form.note}
                  onChange={e => setForm(p => ({ ...p, note: e.target.value }))} />
              </div>

              <div className="form-group">
                <label className="label">Date</label>
                <input type="date" value={form.date}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="btn-outline"
                  style={{ padding: '14px 20px', width: 'auto' }}
                  onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit"
                  className={form.type === 'income' ? 'btn-success' : 'btn-danger'}>
                  {editEntry ? 'Save Changes' : 'Add Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Entries list */}
      {loading ? (
        <p style={{ color: '#64748b', textAlign: 'center' }}>Loading...</p>
      ) : entries.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
          <p style={{ fontSize: '32px' }}>📭</p>
          <p style={{ color: '#64748b', marginTop: '8px' }}>No entries for this date</p>
        </div>
      ) : (
        <>
          {incomeEntries.length > 0 && (
            <>
              <h4 style={{ color: '#16a34a', marginBottom: '8px', fontSize: '14px', fontWeight: '700' }}>
                INCOME ({incomeEntries.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {incomeEntries.map(entry => (
                  <EntryCard key={entry.id} entry={entry} onEdit={openEdit} onDelete={handleDelete} />
                ))}
              </div>
            </>
          )}
          {expenseEntries.length > 0 && (
            <>
              <h4 style={{ color: '#dc2626', marginBottom: '8px', fontSize: '14px', fontWeight: '700' }}>
                EXPENSES ({expenseEntries.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {expenseEntries.map(entry => (
                  <EntryCard key={entry.id} entry={entry} onEdit={openEdit} onDelete={handleDelete} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

function EntryCard({ entry, onEdit, onDelete }) {
  return (
    <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: '600', fontSize: '15px' }}>{entry.categories?.name || 'Uncategorized'}</p>
        {entry.note && <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{entry.note}</p>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <p style={{
          fontWeight: '800', fontSize: '16px',
          color: entry.type === 'income' ? '#16a34a' : '#dc2626'
        }}>
          {entry.type === 'income' ? '+' : '-'}₹{entry.amount.toLocaleString()}
        </p>
        <button onClick={() => onEdit(entry)} style={{
          width: 'auto', padding: '6px 10px', fontSize: '13px',
          background: '#f1f5f9', color: '#475569', borderRadius: '8px'
        }}>✏️</button>
        <button onClick={() => onDelete(entry.id)} style={{
          width: 'auto', padding: '6px 10px', fontSize: '13px',
          background: '#fee2e2', color: '#dc2626', borderRadius: '8px'
        }}>🗑️</button>
      </div>
    </div>
  )
}