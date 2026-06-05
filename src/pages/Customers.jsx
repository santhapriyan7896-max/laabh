import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function Customers({ profile }) {
  const [customers, setCustomers] = useState([])
  const [selected, setSelected] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [showAddTx, setShowAddTx] = useState(null)
  const [editCustomer, setEditCustomer] = useState(null)
  const [loading, setLoading] = useState(true)

  const [custForm, setCustForm] = useState({ name: '', phone: '' })
  const [txForm, setTxForm] = useState({ amount: '', note: '' })

  useEffect(() => { if (profile) fetchCustomers() }, [profile])

  const fetchCustomers = async () => {
    setLoading(true)
    const { data: custs } = await supabase
      .from('customers').select('*').eq('user_id', profile.id)

    const { data: txs } = await supabase
      .from('credit_transactions').select('*').eq('user_id', profile.id)

    const balanceMap = {}
    ;(txs || []).forEach(t => {
      if (!balanceMap[t.customer_id]) balanceMap[t.customer_id] = 0
      balanceMap[t.customer_id] += t.type === 'credit' ? t.amount : -t.amount
    })

    const withBalance = (custs || [])
      .map(c => ({ ...c, balance: balanceMap[c.id] || 0 }))
      .sort((a, b) => b.balance - a.balance)

    setCustomers(withBalance)
    setLoading(false)
  }

  const fetchTransactions = async (customerId) => {
    const { data } = await supabase
      .from('credit_transactions').select('*')
      .eq('customer_id', customerId)
      .order('date', { ascending: false })
    setTransactions(data || [])
  }

  const selectCustomer = (c) => {
    setSelected(c)
    fetchTransactions(c.id)
  }

  const getBalance = (txs) =>
    txs.reduce((sum, t) => t.type === 'credit' ? sum + t.amount : sum - t.amount, 0)

  const handleSaveCustomer = async (e) => {
    e.preventDefault()
    if (editCustomer) {
      await supabase.from('customers').update(custForm).eq('id', editCustomer.id)
      setSelected(prev => ({ ...prev, ...custForm }))
    } else {
      await supabase.from('customers').insert({ ...custForm, user_id: profile.id })
    }
    setCustForm({ name: '', phone: '' })
    setShowAddCustomer(false)
    setEditCustomer(null)
    fetchCustomers()
  }

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm('Delete this customer and all their records?')) return
    await supabase.from('credit_transactions').delete().eq('customer_id', id)
    await supabase.from('customers').delete().eq('id', id)
    setSelected(null)
    fetchCustomers()
  }

  const handleAddTransaction = async (e) => {
    e.preventDefault()
    await supabase.from('credit_transactions').insert({
      customer_id: selected.id,
      user_id: profile.id,
      amount: parseFloat(txForm.amount),
      type: showAddTx,
      note: txForm.note,
      date: new Date().toISOString().split('T')[0]
    })
    setTxForm({ amount: '', note: '' })
    setShowAddTx(null)
    fetchTransactions(selected.id)
    fetchCustomers()
  }

  const handleDeleteTx = async (id) => {
    if (!window.confirm('Delete this transaction?')) return
    await supabase.from('credit_transactions').delete().eq('id', id)
    fetchTransactions(selected.id)
    fetchCustomers()
  }

  const sendWhatsApp = (customer, balance) => {
    const msg = `Hello ${customer.name}, your outstanding balance at ${profile.shop_name} is ₹${balance}. Please make the payment at your earliest convenience. Thank you!`
    window.open(`https://wa.me/91${customer.phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const customerForm = showAddCustomer ? (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', zIndex: 200 }}>
      <div style={{ background: 'white', width: '100%', maxWidth: '480px', margin: '0 auto', borderRadius: '20px 20px 0 0', padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>
          {editCustomer ? 'Edit Customer' : 'Add Customer'}
        </h3>
        <form onSubmit={handleSaveCustomer}>
          <div className="form-group">
            <label className="label">Customer Name</label>
            <input type="text" placeholder="e.g. Ravi Kumar"
              value={custForm.name} onChange={e => setCustForm(p => ({ ...p, name: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="label">Phone Number</label>
            <input type="tel" placeholder="9876543210"
              value={custForm.phone} onChange={e => setCustForm(p => ({ ...p, phone: e.target.value }))} required />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="btn-outline" style={{ width: 'auto', padding: '14px 20px' }}
              onClick={() => { setShowAddCustomer(false); setEditCustomer(null) }}>Cancel</button>
            <button type="submit" className="btn-primary">
              {editCustomer ? 'Save Changes' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null

  // Customer detail view
  if (selected) {
    const balance = getBalance(transactions)
    return (
      <div className="page">
        <button onClick={() => setSelected(null)} style={{
          width: 'auto', padding: '8px 14px', background: '#f1f5f9',
          color: '#475569', fontSize: '14px', marginBottom: '16px', borderRadius: '8px'
        }}>← Back</button>

        {customerForm}

        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800' }}>{selected.name}</h2>
              <p style={{ color: '#64748b', fontSize: '14px' }}>📞 {selected.phone}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Balance</p>
              <p style={{ fontSize: '24px', fontWeight: '800', color: balance > 0 ? '#dc2626' : '#16a34a' }}>
                ₹{Math.abs(balance).toLocaleString()}
              </p>
              <p style={{ fontSize: '11px', color: balance > 0 ? '#dc2626' : balance < 0 ? '#16a34a' : '#64748b' }}>
                {balance > 0 ? 'owes you' : balance < 0 ? 'advance paid' : 'settled'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
            {balance > 0 && (
              <button onClick={() => sendWhatsApp(selected, balance)} style={{
                flex: 1, background: '#25D366', color: 'white',
                padding: '10px', fontSize: '13px', borderRadius: '8px'
              }}>📲 WhatsApp Reminder</button>
            )}
            <button onClick={() => {
              setEditCustomer(selected)
              setCustForm({ name: selected.name, phone: selected.phone })
              setShowAddCustomer(true)
            }} style={{ width: 'auto', padding: '10px 14px', background: '#f1f5f9', color: '#475569', fontSize: '13px', borderRadius: '8px' }}>✏️</button>
            <button onClick={() => handleDeleteCustomer(selected.id)}
              style={{ width: 'auto', padding: '10px 14px', background: '#fee2e2', color: '#dc2626', fontSize: '13px', borderRadius: '8px' }}>🗑️</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button className="btn-danger" onClick={() => setShowAddTx('credit')}
            style={{ fontSize: '14px', padding: '12px' }}>+ Credit Given</button>
          <button className="btn-success" onClick={() => setShowAddTx('payment')}
            style={{ fontSize: '14px', padding: '12px' }}>+ Payment Received</button>
        </div>

        {showAddTx && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', zIndex: 200 }}>
            <div style={{ background: 'white', width: '100%', maxWidth: '480px', margin: '0 auto', borderRadius: '20px 20px 0 0', padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>
                {showAddTx === 'credit' ? 'Credit Given' : 'Payment Received'}
              </h3>
              <form onSubmit={handleAddTransaction}>
                <div className="form-group">
                  <label className="label">Amount (₹)</label>
                  <input type="number" placeholder="0" min="1"
                    value={txForm.amount} onChange={e => setTxForm(p => ({ ...p, amount: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="label">Note (optional)</label>
                  <input type="text" placeholder="e.g. groceries"
                    value={txForm.note} onChange={e => setTxForm(p => ({ ...p, note: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" className="btn-outline" style={{ width: 'auto', padding: '14px 20px' }}
                    onClick={() => setShowAddTx(null)}>Cancel</button>
                  <button type="submit" className={showAddTx === 'credit' ? 'btn-danger' : 'btn-success'}>Save</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <h4 style={{ fontWeight: '700', marginBottom: '12px' }}>Transaction History</h4>
        {transactions.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
            <p style={{ color: '#64748b' }}>No transactions yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {transactions.map(tx => (
              <div key={tx.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: '600', color: tx.type === 'credit' ? '#dc2626' : '#16a34a' }}>
                    {tx.type === 'credit' ? 'Credit Given' : 'Payment Received'}
                  </p>
                  {tx.note && <p style={{ fontSize: '12px', color: '#64748b' }}>{tx.note}</p>}
                  <p style={{ fontSize: '11px', color: '#94a3b8' }}>{tx.date}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <p style={{ fontWeight: '800', color: tx.type === 'credit' ? '#dc2626' : '#16a34a' }}>
                    {tx.type === 'credit' ? '-' : '+'}₹{tx.amount.toLocaleString()}
                  </p>
                  <button onClick={() => handleDeleteTx(tx.id)} style={{
                    width: 'auto', padding: '6px 10px', background: '#fee2e2', color: '#dc2626', fontSize: '13px', borderRadius: '8px'
                  }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Customer list view
  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Customers</h2>
        <button onClick={() => { setEditCustomer(null); setCustForm({ name: '', phone: '' }); setShowAddCustomer(true) }}
          style={{ width: 'auto', padding: '10px 16px', fontSize: '14px' }} className="btn-primary">
          + Add
        </button>
      </div>

      {customerForm}

      {loading ? (
        <p style={{ color: '#64748b', textAlign: 'center' }}>Loading...</p>
      ) : customers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
          <p style={{ fontSize: '32px' }}>👥</p>
          <p style={{ color: '#64748b', marginTop: '8px' }}>No customers yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {customers.map(c => (
            <div key={c.id} className="card" onClick={() => selectCustomer(c)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <div>
                <p style={{ fontWeight: '700', fontSize: '16px' }}>{c.name}</p>
                <p style={{ fontSize: '13px', color: '#64748b' }}>📞 {c.phone}</p>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div>
                  <p style={{
                    fontWeight: '800', fontSize: '16px',
                    color: c.balance > 0 ? '#dc2626' : c.balance < 0 ? '#16a34a' : '#64748b'
                  }}>₹{Math.abs(c.balance).toLocaleString()}</p>
                  <p style={{ fontSize: '11px', color: c.balance > 0 ? '#dc2626' : c.balance < 0 ? '#16a34a' : '#64748b' }}>
                    {c.balance > 0 ? 'owes you' : c.balance < 0 ? 'advance' : 'settled'}
                  </p>
                </div>
                <span style={{ color: '#94a3b8', fontSize: '20px' }}>›</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}