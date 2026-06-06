import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { format } from 'date-fns'
import { useVoice } from '../hooks/useVoice'
import { parseEntryFromVoice } from '../utils/parseVoice'

export default function Entries({ profile }) {
  const [entries, setEntries] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editEntry, setEditEntry] = useState(null)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [voiceResult, setVoiceResult] = useState(null)
  const [voiceError, setVoiceError] = useState('')

  const [form, setForm] = useState({ category_id: '', amount: '', note: '', date: format(new Date(), 'yyyy-MM-dd'), type: 'income' })

  const { listening, startListening } = useVoice(
    (transcript) => {
      const parsed = parseEntryFromVoice(transcript, categories)
      setVoiceResult(parsed)
    },
    (err) => setVoiceError(err)
  )

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

  const handleVoiceSave = async () => {
  if (voiceResult.amount) {
    await supabase.from('entries').insert({
      user_id: profile.id,
      category_id: voiceResult.category?.id || null,
      type: voiceResult.type,
      amount: voiceResult.amount,
      note: voiceResult.transcript,
      date: new Date().toISOString().split('T')[0]
    })
    setVoiceResult(null)
    fetchEntries()
  } else {
    // Only open manual form if amount is missing
    setForm({
      category_id: voiceResult.category?.id || '',
      amount: '',
      note: voiceResult.transcript,
      date: new Date().toISOString().split('T')[0],
      type: voiceResult.type
    })
    setVoiceResult(null)
    setShowForm(true)
  }
}

  const filteredCats = categories.filter(c => c.type === form.type)
  const incomeEntries = entries.filter(e => e.type === 'income')
  const expenseEntries = entries.filter(e => e.type === 'expense')

  return (
    <div className="page">

      {/* Date picker */}
      <div className="form-group">
        <label className="label">Date</label>
        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
      </div>

      {/* Add buttons + mic */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
        <button className="btn-success" onClick={() => openAdd('income')}
          style={{ fontSize: '14px', padding: '12px' }}>+ Income</button>
        <button className="btn-danger" onClick={() => openAdd('expense')}
          style={{ fontSize: '14px', padding: '12px' }}>+ Expense</button>
        <button onClick={startListening} style={{
          width: 'auto', padding: '12px 16px', borderRadius: '10px',
          fontSize: '20px', border: 'none', cursor: 'pointer',
          background: listening ? '#dc2626' : '#f1f5f9',
          transition: 'background 0.2s'
        }}>🎤</button>
      </div>

      {listening && (
        <p style={{ color: '#2563eb', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
          🎙️ Listening... speak now
        </p>
      )}

      {voiceError && (
        <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '12px',
          background: '#fee2e2', padding: '10px', borderRadius: '8px' }}>
          ⚠️ {voiceError}
        </p>
      )}

      <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '20px' }}>
        🎤 Say: "தீவனம் 500 செலவு" or "sales 2000 income"
      </p>

      {/* Entry form modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', zIndex: 200 }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '480px', margin: '0 auto', borderRadius: '20px 20px 0 0', padding: '24px' }}>
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

      {/* Voice confirmation modal */}
      {voiceResult && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', zIndex: 300 }}>
    <div style={{ background: 'white', width: '100%', maxWidth: '480px', margin: '0 auto', borderRadius: '20px 20px 0 0', padding: '24px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>🎤 Voice Entry</h3>
      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>"{voiceResult.transcript}"</p>

      <div className="card" style={{ marginBottom: '16px', borderLeft: `4px solid ${voiceResult.type === 'income' ? '#16a34a' : '#dc2626'}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Type</span>
          <span style={{ fontWeight: '700', color: voiceResult.type === 'income' ? '#16a34a' : '#dc2626' }}>
            {voiceResult.type === 'income' ? 'Income' : 'Expense'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Category</span>
          <span style={{ fontWeight: '700', color: voiceResult.category ? '#1e293b' : '#94a3b8' }}>
            {voiceResult.category?.name || 'Not detected'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Amount</span>
          <span style={{ fontWeight: '800', fontSize: '18px' }}>
            {voiceResult.amount ? `₹${voiceResult.amount}` : '—'}
          </span>
        </div>
      </div>

      {!voiceResult.amount && (
        <p style={{ color: '#d97706', fontSize: '13px', marginBottom: '14px', background: '#fef3c7', padding: '10px', borderRadius: '8px' }}>
          ⚠️ Could not detect amount. Tap "Edit & Save" to fill manually.
        </p>
      )}

      <div style={{ display: 'flex', gap: '10px' }}>
        <button className="btn-outline" style={{ width: 'auto', padding: '14px 20px' }}
          onClick={() => setVoiceResult(null)}>Cancel</button>
        <button
          className={voiceResult.type === 'income' ? 'btn-success' : 'btn-danger'}
          onClick={handleVoiceSave}>
          {voiceResult.amount ? '✓ Save Entry' : 'Edit & Save'}
        </button>
      </div>
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
        <p style={{ fontWeight: '800', fontSize: '16px', color: entry.type === 'income' ? '#16a34a' : '#dc2626' }}>
          {entry.type === 'income' ? '+' : '-'}₹{entry.amount.toLocaleString()}
        </p>
        <button onClick={() => onEdit(entry)} style={{ width: 'auto', padding: '6px 10px', fontSize: '13px', background: '#f1f5f9', color: '#475569', borderRadius: '8px' }}>✏️</button>
        <button onClick={() => onDelete(entry.id)} style={{ width: 'auto', padding: '6px 10px', fontSize: '13px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px' }}>🗑️</button>
      </div>
    </div>
  )
}