import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import jsPDF from 'jspdf'

export default function Reports({ profile }) {
  const [tab, setTab] = useState('daily')
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (profile) fetchEntries() }, [profile, selectedDate, selectedMonth, tab])

  const fetchEntries = async () => {
    setLoading(true)
    let query = supabase
      .from('entries')
      .select('*, categories(name)')
      .eq('user_id', profile.id)
      .order('date', { ascending: false })

    if (tab === 'daily') {
      query = query.eq('date', selectedDate)
    } else {
      const start = format(startOfMonth(new Date(selectedMonth + '-01')), 'yyyy-MM-dd')
      const end = format(endOfMonth(new Date(selectedMonth + '-01')), 'yyyy-MM-dd')
      query = query.gte('date', start).lte('date', end)
    }

    const { data } = await query
    setEntries(data || [])
    setLoading(false)
  }

  const income = entries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0)
  const expense = entries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
  const profit = income - expense

  // Group by category for breakdown
  const breakdown = entries.reduce((acc, e) => {
    const key = e.categories?.name || 'Uncategorized'
    if (!acc[key]) acc[key] = { type: e.type, total: 0 }
    acc[key].total += e.amount
    return acc
  }, {})

  const exportPDF = () => {
    const doc = new jsPDF()
    const title = tab === 'daily'
      ? `Daily Report — ${format(new Date(selectedDate), 'dd MMM yyyy')}`
      : `Monthly Report — ${format(new Date(selectedMonth + '-01'), 'MMM yyyy')}`

    doc.setFontSize(18)
    doc.setTextColor(37, 99, 235)
    doc.text('HisabBook', 20, 20)

    doc.setFontSize(13)
    doc.setTextColor(30, 41, 59)
    doc.text(title, 20, 32)
    doc.text(`Shop: ${profile.shop_name}`, 20, 42)

    doc.setFontSize(12)
    doc.setTextColor(22, 163, 74)
    doc.text(`Total Income:  Rs. ${income.toLocaleString()}`, 20, 58)
    doc.setTextColor(220, 38, 38)
    doc.text(`Total Expense: Rs. ${expense.toLocaleString()}`, 20, 68)
    doc.setTextColor(37, 99, 235)
    doc.text(`Net Profit:    Rs. ${profit.toLocaleString()}`, 20, 78)

    doc.setTextColor(100, 116, 139)
    doc.setFontSize(11)
    doc.text('Category Breakdown:', 20, 94)

    let y = 104
    Object.entries(breakdown).forEach(([name, val]) => {
      doc.setTextColor(val.type === 'income' ? 22 : 220, val.type === 'income' ? 163 : 38, val.type === 'income' ? 74 : 38)
      doc.text(`${name}: Rs. ${val.total.toLocaleString()} (${val.type})`, 24, y)
      y += 10
    })

    doc.setFontSize(10)
    doc.setTextColor(148, 163, 184)
    doc.text(`Generated on ${format(new Date(), 'dd MMM yyyy, hh:mm a')}`, 20, 280)

    doc.save(`HisabBook_${tab}_${tab === 'daily' ? selectedDate : selectedMonth}.pdf`)
  }

  return (
    <div className="page">
      <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>Reports</h2>

      {/* Tab switcher */}
      <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '10px', padding: '4px', marginBottom: '16px' }}>
        {['daily', 'monthly'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '10px', borderRadius: '8px', fontSize: '14px',
            background: tab === t ? 'white' : 'transparent',
            color: tab === t ? '#2563eb' : '#64748b',
            boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            fontWeight: tab === t ? '700' : '500'
          }}>{t === 'daily' ? 'Daily' : 'Monthly'}</button>
        ))}
      </div>

      {/* Date/Month picker */}
      <div className="form-group">
        {tab === 'daily' ? (
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
        ) : (
          <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} />
        )}
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#64748b' }}>Loading...</p>
      ) : (
        <>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div className="card" style={{ borderLeft: '4px solid #16a34a' }}>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Income</p>
              <p style={{ fontSize: '20px', fontWeight: '800', color: '#16a34a' }}>₹{income.toLocaleString()}</p>
            </div>
            <div className="card" style={{ borderLeft: '4px solid #dc2626' }}>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Expense</p>
              <p style={{ fontSize: '20px', fontWeight: '800', color: '#dc2626' }}>₹{expense.toLocaleString()}</p>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '20px', borderLeft: `4px solid ${profit >= 0 ? '#2563eb' : '#dc2626'}` }}>
            <p style={{ fontSize: '12px', color: '#64748b' }}>Net Profit</p>
            <p style={{ fontSize: '26px', fontWeight: '800', color: profit >= 0 ? '#2563eb' : '#dc2626' }}>
              ₹{profit.toLocaleString()}
            </p>
          </div>

          {/* Category breakdown */}
          {Object.keys(breakdown).length > 0 && (
            <>
              <h4 style={{ fontWeight: '700', marginBottom: '12px' }}>Category Breakdown</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                {Object.entries(breakdown)
                  .sort((a, b) => b[1].total - a[1].total)
                  .map(([name, val]) => (
                    <div key={name} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontWeight: '600' }}>{name}</p>
                      <p style={{ fontWeight: '800', color: val.type === 'income' ? '#16a34a' : '#dc2626' }}>
                        {val.type === 'income' ? '+' : '-'}₹{val.total.toLocaleString()}
                      </p>
                    </div>
                  ))}
              </div>
            </>
          )}

          {entries.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
              <p style={{ fontSize: '32px' }}>📭</p>
              <p style={{ color: '#64748b', marginTop: '8px' }}>No entries for this period</p>
            </div>
          )}

          {/* PDF Export */}
          {entries.length > 0 && (
            <button className="btn-primary" onClick={exportPDF}>
              📄 Download PDF Report
            </button>
          )}
        </>
      )}
    </div>
  )
}