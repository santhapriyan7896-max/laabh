import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { format } from 'date-fns'

export default function Home({ profile }) {
  const [summary, setSummary] = useState({ income: 0, expense: 0 })
  const [recentEntries, setRecentEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const today = format(new Date(), 'yyyy-MM-dd')
  const displayDate = format(new Date(), 'dd MMM yyyy')

  useEffect(() => {
  if (profile) {
    fetchData()
  } else {
    setLoading(false)
  }
}, [profile])

  const fetchData = async () => {
    setLoading(true)

    // Today's entries
    const { data: entries } = await supabase
      .from('entries')
      .select('*, categories(name)')
      .eq('user_id', profile.id)
      .eq('date', today)
      .order('created_at', { ascending: false })

    if (entries) {
      const income = entries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0)
      const expense = entries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
      setSummary({ income, expense })
      setRecentEntries(entries.slice(0, 5))
    }

    setLoading(false)
  }

  const profit = summary.income - summary.expense

  return (
    <div className="page">

      {/* Date */}
      <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>
        📅 {displayDate}
      </p>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <div className="card" style={{ borderLeft: '4px solid #16a34a' }}>
          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Income</p>
          <p style={{ fontSize: '22px', fontWeight: '800', color: '#16a34a' }}>₹{summary.income.toLocaleString()}</p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #dc2626' }}>
          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Expense</p>
          <p style={{ fontSize: '22px', fontWeight: '800', color: '#dc2626' }}>₹{summary.expense.toLocaleString()}</p>
        </div>
      </div>

      {/* Profit card */}
      <div className="card" style={{
        marginBottom: '20px',
        borderLeft: `4px solid ${profit >= 0 ? '#2563eb' : '#dc2626'}`
      }}>
        <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Today's Profit</p>
        <p style={{ fontSize: '28px', fontWeight: '800', color: profit >= 0 ? '#2563eb' : '#dc2626' }}>
          ₹{profit.toLocaleString()}
        </p>
      </div>

      {/* Recent entries */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Today's Entries</h3>
        <span style={{ fontSize: '12px', color: '#64748b' }}>{recentEntries.length} entries</span>
      </div>

      {loading ? (
        <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>Loading...</p>
      ) : recentEntries.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
          <p style={{ fontSize: '32px', marginBottom: '8px' }}>📭</p>
          <p style={{ color: '#64748b' }}>No entries today</p>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>Go to Entries tab to add</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {recentEntries.map(entry => (
            <div key={entry.id} className="card" style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <p style={{ fontWeight: '600', fontSize: '15px' }}>{entry.categories?.name || 'Uncategorized'}</p>
                {entry.note && <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{entry.note}</p>}
              </div>
              <p style={{
                fontWeight: '800', fontSize: '16px',
                color: entry.type === 'income' ? '#16a34a' : '#dc2626'
              }}>
                {entry.type === 'income' ? '+' : '-'}₹{entry.amount.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}