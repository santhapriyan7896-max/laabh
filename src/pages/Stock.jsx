import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const UNITS = ['kg', 'litre', 'pieces', 'bags', 'boxes', 'bottles', 'dozen', 'gram', 'ton']

export default function Stock({ profile }) {
  const [items, setItems] = useState([])
  const [selected, setSelected] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showItemForm, setShowItemForm] = useState(false)
  const [showTxForm, setShowTxForm] = useState(null)
  const [editItem, setEditItem] = useState(null)
  const [search, setSearch] = useState('')
  const [itemForm, setItemForm] = useState({ name: '', quantity: '', unit: 'kg', low_stock_threshold: '10' })
  const [txForm, setTxForm] = useState({ quantity: '', note: '' })

  useEffect(() => { if (profile) fetchItems() }, [profile])

  const fetchItems = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('stock_items').select('*')
      .eq('user_id', profile.id).order('name')
    setItems(data || [])
    setLoading(false)
  }

  const fetchTransactions = async (itemId) => {
    const { data } = await supabase
      .from('stock_transactions').select('*')
      .eq('stock_item_id', itemId)
      .order('created_at', { ascending: false })
    setTransactions(data || [])
  }

  const selectItem = (item) => { setSelected(item); fetchTransactions(item.id) }

  const handleSaveItem = async (e) => {
    e.preventDefault()
    const payload = {
      user_id: profile.id,
      name: itemForm.name,
      quantity: parseFloat(itemForm.quantity) || 0,
      unit: itemForm.unit,
      low_stock_threshold: parseFloat(itemForm.low_stock_threshold) || 10
    }
    if (editItem) {
      await supabase.from('stock_items').update(payload).eq('id', editItem.id)
      setSelected(prev => ({ ...prev, ...payload }))
    } else {
      await supabase.from('stock_items').insert(payload)
    }
    setItemForm({ name: '', quantity: '', unit: 'kg', low_stock_threshold: '10' })
    setShowItemForm(false)
    setEditItem(null)
    fetchItems()
  }

  const handleTransaction = async (e) => {
    e.preventDefault()
    const qty = parseFloat(txForm.quantity)
    const newQty = showTxForm === 'add'
      ? selected.quantity + qty
      : Math.max(0, selected.quantity - qty)

    await supabase.from('stock_transactions').insert({
      stock_item_id: selected.id,
      user_id: profile.id,
      type: showTxForm,
      quantity: qty,
      note: txForm.note,
      date: new Date().toISOString().split('T')[0]
    })
    await supabase.from('stock_items').update({ quantity: newQty }).eq('id', selected.id)
    setSelected(prev => ({ ...prev, quantity: newQty }))
    setTxForm({ quantity: '', note: '' })
    setShowTxForm(null)
    fetchTransactions(selected.id)
    fetchItems()
  }

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Delete this item and all its history?')) return
    await supabase.from('stock_transactions').delete().eq('stock_item_id', id)
    await supabase.from('stock_items').delete().eq('id', id)
    setSelected(null)
    fetchItems()
  }

  const isLow = (item) => item.quantity <= item.low_stock_threshold

  const itemForm_jsx = showItemForm ? (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', zIndex: 200 }}>
      <div style={{ background: 'white', width: '100%', maxWidth: '480px', margin: '0 auto', borderRadius: '20px 20px 0 0', padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>
          {editItem ? 'Edit Item' : 'Add Stock Item'}
        </h3>
        <form onSubmit={handleSaveItem}>
          <div className="form-group">
            <label className="label">Item Name</label>
            <input type="text" placeholder="e.g. Fodder, Medicine A"
              value={itemForm.name} onChange={e => setItemForm(p => ({ ...p, name: e.target.value }))} required />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="label">Current Quantity</label>
              <input type="number" placeholder="0" min="0"
                value={itemForm.quantity} onChange={e => setItemForm(p => ({ ...p, quantity: e.target.value }))} required />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="label">Unit</label>
              <select value={itemForm.unit} onChange={e => setItemForm(p => ({ ...p, unit: e.target.value }))}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="label">Low Stock Alert Below</label>
            <input type="number" placeholder="e.g. 10"
              value={itemForm.low_stock_threshold}
              onChange={e => setItemForm(p => ({ ...p, low_stock_threshold: e.target.value }))} required />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="btn-outline" style={{ width: 'auto', padding: '14px 20px' }}
              onClick={() => { setShowItemForm(false); setEditItem(null) }}>Cancel</button>
            <button type="submit" className="btn-primary">
              {editItem ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null

  // Detail view
  if (selected) {
    return (
      <div className="page">
        <button onClick={() => setSelected(null)} style={{
          width: 'auto', padding: '8px 14px', background: '#f1f5f9',
          color: '#475569', fontSize: '14px', marginBottom: '16px', borderRadius: '8px'
        }}>← Back</button>

        {showItemForm && itemForm_jsx}

        <div className="card" style={{ marginBottom: '16px', borderLeft: `4px solid ${isLow(selected) ? '#dc2626' : '#16a34a'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: '800' }}>{selected.name}</h2>
              {isLow(selected) && (
                <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', display: 'inline-block', marginTop: '4px' }}>
                  ⚠️ LOW STOCK
                </span>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '32px', fontWeight: '900', color: isLow(selected) ? '#dc2626' : '#16a34a' }}>{selected.quantity}</p>
              <p style={{ fontSize: '13px', color: '#64748b' }}>{selected.unit}</p>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>Alert below: {selected.low_stock_threshold} {selected.unit}</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
            <button onClick={() => {
              setEditItem(selected)
              setItemForm({ name: selected.name, quantity: selected.quantity, unit: selected.unit, low_stock_threshold: selected.low_stock_threshold })
              setShowItemForm(true)
            }} style={{ width: 'auto', padding: '10px 14px', background: '#f1f5f9', color: '#475569', fontSize: '13px', borderRadius: '8px' }}>✏️ Edit</button>
            <button onClick={() => handleDeleteItem(selected.id)}
              style={{ width: 'auto', padding: '10px 14px', background: '#fee2e2', color: '#dc2626', fontSize: '13px', borderRadius: '8px' }}>🗑️ Delete</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button className="btn-success" onClick={() => setShowTxForm('add')} style={{ fontSize: '14px', padding: '12px' }}>+ Add Stock</button>
          <button className="btn-danger" onClick={() => setShowTxForm('deduct')} style={{ fontSize: '14px', padding: '12px' }}>− Deduct Stock</button>
        </div>

        {showTxForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', zIndex: 200 }}>
            <div style={{ background: 'white', width: '100%', maxWidth: '480px', margin: '0 auto', borderRadius: '20px 20px 0 0', padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>
                {showTxForm === 'add' ? `Add Stock — ${selected.name}` : `Deduct Stock — ${selected.name}`}
              </h3>
              <form onSubmit={handleTransaction}>
                <div className="form-group">
                  <label className="label">Quantity ({selected.unit})</label>
                  <input type="number" placeholder="0" min="0.1" step="0.1"
                    value={txForm.quantity} onChange={e => setTxForm(p => ({ ...p, quantity: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="label">Note (optional)</label>
                  <input type="text" placeholder={showTxForm === 'add' ? 'e.g. Bought from supplier' : 'e.g. Used today'}
                    value={txForm.note} onChange={e => setTxForm(p => ({ ...p, note: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" className="btn-outline" style={{ width: 'auto', padding: '14px 20px' }}
                    onClick={() => setShowTxForm(null)}>Cancel</button>
                  <button type="submit" className={showTxForm === 'add' ? 'btn-success' : 'btn-danger'}>
                    {showTxForm === 'add' ? 'Add Stock' : 'Deduct Stock'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <h4 style={{ fontWeight: '700', marginBottom: '12px' }}>Stock History</h4>
        {transactions.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
            <p style={{ color: '#64748b' }}>No transactions yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {transactions.map(tx => (
              <div key={tx.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: '600', color: tx.type === 'add' ? '#16a34a' : '#dc2626' }}>
                    {tx.type === 'add' ? '↑ Added' : '↓ Deducted'}
                  </p>
                  {tx.note && <p style={{ fontSize: '12px', color: '#64748b' }}>{tx.note}</p>}
                  <p style={{ fontSize: '11px', color: '#94a3b8' }}>{tx.date}</p>
                </div>
                <p style={{ fontWeight: '800', fontSize: '18px', color: tx.type === 'add' ? '#16a34a' : '#dc2626' }}>
                  {tx.type === 'add' ? '+' : '-'}{tx.quantity} {selected.unit}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // List view
  const lowStockItems = items.filter(isLow)
  const filteredItems = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Stock</h2>
        <button onClick={() => { setEditItem(null); setItemForm({ name: '', quantity: '', unit: 'kg', low_stock_threshold: '10' }); setShowItemForm(true) }}
          className="btn-primary" style={{ width: 'auto', padding: '10px 16px', fontSize: '14px' }}>+ Add Item</button>
      </div>

      {itemForm_jsx}

      {lowStockItems.length > 0 && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <div>
            <p style={{ fontWeight: '700', color: '#dc2626', fontSize: '14px' }}>{lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} running low</p>
            <p style={{ fontSize: '12px', color: '#ef4444' }}>{lowStockItems.map(i => i.name).join(', ')}</p>
          </div>
        </div>
      )}

      <div className="form-group">
        <input type="text" placeholder="🔍 Search stock items..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#64748b' }}>Loading...</p>
      ) : filteredItems.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
          <p style={{ fontSize: '32px' }}>📦</p>
          <p style={{ color: '#64748b', marginTop: '8px' }}>{search ? 'No items match your search' : 'No stock items yet'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredItems.map(item => (
            <div key={item.id} className="card" onClick={() => selectItem(item)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderLeft: `4px solid ${isLow(item) ? '#dc2626' : '#16a34a'}` }}>
              <div>
                <p style={{ fontWeight: '700', fontSize: '16px' }}>{item.name}</p>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Alert below {item.low_stock_threshold} {item.unit}</p>
                {isLow(item) && (
                  <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', display: 'inline-block', marginTop: '4px' }}>
                    ⚠️ LOW STOCK
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: '900', fontSize: '22px', color: isLow(item) ? '#dc2626' : '#16a34a' }}>{item.quantity}</p>
                  <p style={{ fontSize: '12px', color: '#64748b' }}>{item.unit}</p>
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