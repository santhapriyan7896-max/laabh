import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { format } from 'date-fns'

export default function Admin({ onExit }) {
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => { fetchShops() }, [])

  const fetchShops = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_admin', false)
      .order('created_at', { ascending: false })
    setShops(data || [])
    setLoading(false)
  }

  const updateStatus = async (id, status) => {
    await supabase.from('profiles').update({ subscription_status: status }).eq('id', id)
    fetchShops()
    if (selected?.id === id) setSelected(prev => ({ ...prev, subscription_status: status }))
  }

  const activeShops = shops.filter(s => s.subscription_status === 'active')
  const trialShops = shops.filter(s => s.subscription_status === 'trial')
  const mrr = activeShops.length * 499

  const statusColor = (status) => {
    if (status === 'active') return '#16a34a'
    if (status === 'trial') return '#d97706'
    return '#dc2626'
  }

  const statusBg = (status) => {
    if (status === 'active') return '#dcfce7'
    if (status === 'trial') return '#fef3c7'
    return '#fee2e2'
  }

  if (selected) {
    return (
      <div className="page">
        <button onClick={() => setSelected(null)} style={{
          width: 'auto', padding: '8px 14px', background: '#f1f5f9',
          color: '#475569', fontSize: '14px', marginBottom: '16px', borderRadius: '8px'
        }}>← Back</button>

        <div className="card" style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800' }}>{selected.shop_name}</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>👤 {selected.owner_name}</p>
          <p style={{ color: '#64748b', fontSize: '14px' }}>📞 {selected.phone}</p>
          <p style={{ color: '#64748b', fontSize: '14px' }}>🏪 {selected.niche}</p>
          <p style={{ color: '#64748b', fontSize: '14px' }}>📅 Joined {format(new Date(selected.created_at), 'dd MMM yyyy')}</p>

          <div style={{
            display: 'inline-block', marginTop: '12px',
            padding: '4px 12px', borderRadius: '20px',
            background: statusBg(selected.subscription_status),
            color: statusColor(selected.subscription_status),
            fontWeight: '700', fontSize: '13px'
          }}>
            {selected.subscription_status?.toUpperCase()}
          </div>
        </div>

        <h4 style={{ fontWeight: '700', marginBottom: '12px' }}>Change Subscription</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {['trial', 'active', 'cancelled'].map(status => (
            <button key={status} onClick={() => updateStatus(selected.id, status)} style={{
              padding: '14px', borderRadius: '10px', fontSize: '15px', fontWeight: '600',
              background: selected.subscription_status === status ? statusBg(status) : '#f8fafc',
              color: selected.subscription_status === status ? statusColor(status) : '#64748b',
              border: `2px solid ${selected.subscription_status === status ? statusColor(status) : '#e2e8f0'}`
            }}>
              {status === 'trial' ? '🟡 Trial' : status === 'active' ? '🟢 Active (₹499/m)' : '🔴 Cancelled'}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Admin Panel</h2>
        <button onClick={onExit} style={{
          width: 'auto', padding: '8px 14px', background: '#f1f5f9',
          color: '#475569', fontSize: '13px', borderRadius: '8px'
        }}>← Exit</button>
      </div>

      {/* MRR Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        <div className="card" style={{ textAlign: 'center', borderTop: '3px solid #2563eb' }}>
          <p style={{ fontSize: '22px', fontWeight: '800', color: '#2563eb' }}>{shops.length}</p>
          <p style={{ fontSize: '11px', color: '#64748b' }}>Total Shops</p>
        </div>
        <div className="card" style={{ textAlign: 'center', borderTop: '3px solid #16a34a' }}>
          <p style={{ fontSize: '22px', fontWeight: '800', color: '#16a34a' }}>{activeShops.length}</p>
          <p style={{ fontSize: '11px', color: '#64748b' }}>Active</p>
        </div>
        <div className="card" style={{ textAlign: 'center', borderTop: '3px solid #d97706' }}>
          <p style={{ fontSize: '22px', fontWeight: '800', color: '#d97706' }}>{trialShops.length}</p>
          <p style={{ fontSize: '11px', color: '#64748b' }}>Trial</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px', borderLeft: '4px solid #16a34a' }}>
        <p style={{ fontSize: '13px', color: '#64748b' }}>Monthly Recurring Revenue</p>
        <p style={{ fontSize: '28px', fontWeight: '800', color: '#16a34a' }}>₹{mrr.toLocaleString()}</p>
        <p style={{ fontSize: '12px', color: '#94a3b8' }}>{activeShops.length} active × ₹499</p>
      </div>

      {/* Shop list */}
      <h4 style={{ fontWeight: '700', marginBottom: '12px' }}>All Shops</h4>
      {loading ? (
        <p style={{ textAlign: 'center', color: '#64748b' }}>Loading...</p>
      ) : shops.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
          <p style={{ fontSize: '32px' }}>🏪</p>
          <p style={{ color: '#64748b', marginTop: '8px' }}>No shops yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {shops.map(shop => (
            <div key={shop.id} className="card" onClick={() => setSelected(shop)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <div>
                <p style={{ fontWeight: '700', fontSize: '15px' }}>{shop.shop_name}</p>
                <p style={{ fontSize: '12px', color: '#64748b' }}>{shop.owner_name} · {shop.niche}</p>
                <p style={{ fontSize: '11px', color: '#94a3b8' }}>
                  {format(new Date(shop.created_at), 'dd MMM yyyy')}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                  background: statusBg(shop.subscription_status),
                  color: statusColor(shop.subscription_status)
                }}>
                  {shop.subscription_status?.toUpperCase()}
                </span>
                <span style={{ color: '#94a3b8', fontSize: '20px' }}>›</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}