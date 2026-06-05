import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../hooks/useAuth'
import Home from './Home'
import Entries from './Entries'
import Customers from './Customers'
import Reports from './Reports'
import Settings from './Settings'

const tabs = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'entries', label: 'Entries', icon: '📝' },
  { id: 'customers', label: 'Customers', icon: '👥' },
  { id: 'reports', label: 'Reports', icon: '📊' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('home')
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('*').eq('id', user.id).single()
        .then(({ data }) => setProfile(data))
    }
  }, [user])

  const renderTab = () => {
    switch (activeTab) {
      case 'home': return <Home profile={profile} />
      case 'entries': return <Entries profile={profile} />
      case 'customers': return <Customers profile={profile} />
      case 'reports': return <Reports profile={profile} />
      case 'settings': return <Settings profile={profile} onProfileUpdate={(updates) => setProfile(p => ({ ...p, ...updates }))} />
      default: return <Home profile={profile} />
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{
        background: '#2563eb', padding: '16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Welcome back,</p>
          <h2 style={{ color: 'white', fontSize: '18px', fontWeight: '700' }}>
            {profile?.shop_name || 'Your Shop'}
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {profile?.is_admin && (
            <button onClick={() => window.location.href = '/hbk-admin-9x7'} style={{
              background: 'rgba(255,255,255,0.2)', color: 'white',
              width: 'auto', padding: '8px 14px', fontSize: '13px', borderRadius: '8px'
            }}>🛡️ Admin</button>
          )}
          <button onClick={signOut} style={{
            background: 'rgba(255,255,255,0.2)', color: 'white',
            width: 'auto', padding: '8px 14px', fontSize: '13px', borderRadius: '8px'
          }}>Logout</button>
        </div>
      </div>

      <div>{renderTab()}</div>

      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '480px',
        background: 'white', borderTop: '1px solid #e2e8f0',
        display: 'flex', zIndex: 100
      }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1, padding: '8px 0', background: 'transparent',
            borderRadius: 0, fontSize: '9px', fontWeight: '600',
            color: activeTab === tab.id ? '#2563eb' : '#94a3b8',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
            borderTop: activeTab === tab.id ? '2px solid #2563eb' : '2px solid transparent'
          }}>
            <span style={{ fontSize: '18px' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}