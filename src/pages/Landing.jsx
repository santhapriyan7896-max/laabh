import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

const styles = `
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-12px); }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeInLeft {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes fadeInRight {
    from { opacity: 0; transform: translateX(30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4); }
    50% { box-shadow: 0 0 0 16px rgba(37, 99, 235, 0); }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes blob1 {
    0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
    50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
  }
  @keyframes blob2 {
    0%, 100% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
    50% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
  }
  .animate-on-scroll {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .animate-on-scroll.visible {
    opacity: 1;
    transform: translateY(0);
  }
  .feature-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: default;
  }
  .feature-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 32px rgba(37,99,235,0.15) !important;
  }
  .niche-card {
    transition: transform 0.3s ease, background 0.3s ease;
    cursor: default;
  }
  .niche-card:hover {
    transform: scale(1.05);
    background: #dbeafe !important;
  }
  .cta-btn {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    display: inline-block;
    text-decoration: none;
  }
  .cta-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(37,99,235,0.4) !important;
  }
  .nav-link {
    transition: background 0.2s, color 0.2s;
    text-decoration: none;
  }
  .problem-card {
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .problem-card:hover {
    transform: translateX(6px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
  }
  .shimmer-btn {
    position: relative;
    overflow: hidden;
  }
  .shimmer-btn::after {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 60%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    animation: shimmer 2s infinite;
  }
`

function useScrollAnimation() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 }
    )
    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

function Typewriter({ texts }) {
  const [display, setDisplay] = useState('')
  const [idx, setIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = texts[idx]
    const speed = deleting ? 40 : 80
    const timeout = setTimeout(() => {
      if (!deleting && charIdx < current.length) {
        setDisplay(current.slice(0, charIdx + 1))
        setCharIdx(c => c + 1)
      } else if (!deleting && charIdx === current.length) {
        setTimeout(() => setDeleting(true), 1800)
      } else if (deleting && charIdx > 0) {
        setDisplay(current.slice(0, charIdx - 1))
        setCharIdx(c => c - 1)
      } else {
        setDeleting(false)
        setIdx(i => (i + 1) % texts.length)
      }
    }, speed)
    return () => clearTimeout(timeout)
  }, [charIdx, deleting, idx, texts])

  return (
    <span>
      {display}
      <span style={{ animation: 'blink 1s infinite', color: '#93c5fd' }}>|</span>
    </span>
  )
}

export default function Landing() {
  useScrollAnimation()

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: '#1e293b', overflowX: 'hidden' }}>
      <style>{styles}</style>

      {/* Navbar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 20px', background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(10px)', borderBottom: '1px solid #e2e8f0',
        position: 'sticky', top: 0, zIndex: 100,
        animation: 'fadeInUp 0.5s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px', height: '32px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ color: 'white', fontWeight: '900', fontSize: '16px' }}>₹</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#2563eb', margin: 0 }}>Laabh</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/login" className="nav-link" style={{
            padding: '8px 18px', borderRadius: '8px', fontSize: '14px',
            fontWeight: '600', color: '#2563eb', border: '2px solid #e0e7ff',
            background: '#f0f4ff'
          }}>Login</Link>
          <Link to="/signup" className="nav-link shimmer-btn" style={{
            padding: '8px 18px', borderRadius: '8px', fontSize: '14px',
            fontWeight: '600', color: 'white', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)'
          }}>Get Started</Link>
        </div>
      </div>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(-45deg, #1e3a8a, #1d4ed8, #2563eb, #3b82f6)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 6s ease infinite',
        padding: '60px 20px 80px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Blobs */}
        <div style={{
          position: 'absolute', top: '-60px', left: '-60px',
          width: '250px', height: '250px',
          background: 'rgba(255,255,255,0.06)',
          animation: 'blob1 8s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', bottom: '-40px', right: '-40px',
          width: '200px', height: '200px',
          background: 'rgba(255,255,255,0.05)',
          animation: 'blob2 10s ease-in-out infinite'
        }} />

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
          padding: '6px 16px', borderRadius: '20px', marginBottom: '24px',
          animation: 'fadeInUp 0.6s ease',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <span style={{ fontSize: '14px' }}>🇮🇳</span>
          <span style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>Built for Indian Shop Owners</span>
        </div>

        {/* Headline */}
        <h2 style={{
          fontSize: '36px', fontWeight: '900', color: 'white',
          lineHeight: '1.15', marginBottom: '16px',
          animation: 'fadeInUp 0.7s ease',
          textShadow: '0 2px 20px rgba(0,0,0,0.2)'
        }}>
          Know Your Shop's<br />
          <span style={{ color: '#93c5fd' }}>
            <Typewriter texts={['Daily Profit', 'Monthly Growth', 'Customer Dues', 'Real Numbers']} />
          </span>
        </h2>

        <p style={{
          fontSize: '16px', color: 'rgba(255,255,255,0.8)',
          maxWidth: '320px', margin: '0 auto 36px',
          animation: 'fadeInUp 0.8s ease', lineHeight: '1.6'
        }}>
          Track income, expenses & customer credit — simpler than a notebook, smarter than Tally
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', animation: 'fadeInUp 0.9s ease' }}>
          <Link to="/signup" className="cta-btn shimmer-btn" style={{
            background: 'white', color: '#2563eb',
            padding: '16px 36px', borderRadius: '14px', fontSize: '17px',
            fontWeight: '800', animation: 'pulse 2s infinite',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            Start Free Trial →
          </Link>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
            ✓ Free to start &nbsp;·&nbsp; ✓ No card needed &nbsp;·&nbsp; ✓ 2 min setup
          </p>
        </div>

        {/* Floating cards */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '12px',
          marginTop: '40px', flexWrap: 'wrap',
          animation: 'fadeInUp 1s ease'
        }}>
          {[
            { label: "Today's Profit", value: '₹4,200', color: '#86efac', icon: '📈' },
            { label: 'Udhaar Pending', value: '₹12,500', color: '#fca5a5', icon: '👥' },
            { label: 'This Month', value: '₹86,000', color: '#93c5fd', icon: '📊' },
          ].map((card, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '14px', padding: '14px 18px',
              animation: `float ${2.5 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`
            }}>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', marginBottom: '4px' }}>{card.icon} {card.label}</p>
              <p style={{ color: card.color, fontSize: '20px', fontWeight: '800' }}>{card.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Problem Section */}
      <div style={{ padding: '50px 20px', background: '#f8fafc' }}>
        <div className="animate-on-scroll" style={{ textAlign: 'center', marginBottom: '28px' }}>
          <span style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '700' }}>THE PROBLEM</span>
          <h3 style={{ fontSize: '24px', fontWeight: '800', marginTop: '12px' }}>Most shop owners are flying blind 😟</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '420px', margin: '0 auto' }}>
          {[
            { emoji: '📒', text: "Tracking accounts in a notebook that anyone can mess up" },
            { emoji: '😤', text: "Customers who 'forget' they owe you money" },
            { emoji: '😵', text: "No idea if you made profit or loss today" },
            { emoji: '💸', text: "Can't figure out where all the money is going" },
            { emoji: '😰', text: "Tally is too complicated, CA is too expensive" },
          ].map((item, i) => (
            <div key={i} className="animate-on-scroll problem-card" style={{
              background: 'white', padding: '14px 16px', borderRadius: '12px',
              display: 'flex', alignItems: 'center', gap: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              animationDelay: `${i * 0.1}s`,
              transitionDelay: `${i * 0.08}s`
            }}>
              <span style={{ fontSize: '24px' }}>{item.emoji}</span>
              <p style={{ fontSize: '14px', color: '#475569', fontWeight: '500' }}>{item.text}</p>
            </div>
          ))}
        </div>

        <div className="animate-on-scroll" style={{
          maxWidth: '420px', margin: '24px auto 0',
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
          borderRadius: '14px', padding: '20px',
          textAlign: 'center'
        }}>
          <p style={{ color: 'white', fontWeight: '800', fontSize: '17px' }}>
            Laabh fixes all of this — in under 2 minutes a day ⚡
          </p>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: '50px 20px' }}>
        <div className="animate-on-scroll" style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ background: '#dbeafe', color: '#2563eb', padding: '4px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '700' }}>FEATURES</span>
          <h3 style={{ fontSize: '24px', fontWeight: '800', marginTop: '12px' }}>Everything your shop needs</h3>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px' }}>No accounting knowledge required</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '440px', margin: '0 auto' }}>
          {[
            { icon: '💰', title: 'Daily Profit Tracker', desc: 'See exactly how much you earned and spent today. One glance = full picture.', color: '#dcfce7', iconBg: '#16a34a' },
            { icon: '👥', title: 'Udhaar (Credit) Tracker', desc: 'Know who owes you and how much. Send WhatsApp reminders with one tap.', color: '#dbeafe', iconBg: '#2563eb' },
            { icon: '📊', title: 'Monthly P&L Reports', desc: 'Download a PDF of your entire month\'s performance. Share with anyone.', color: '#fef3c7', iconBg: '#d97706' },
            { icon: '🏷️', title: 'Custom Categories', desc: 'Veterinary, Fodder, Medicine — set up categories that match YOUR business.', color: '#f3e8ff', iconBg: '#7c3aed' },
            { icon: '📱', title: 'Works on Any Phone', desc: 'No app store needed. Open in Chrome, bookmark it — works like an app.', color: '#fee2e2', iconBg: '#dc2626' },
          ].map((f, i) => (
            <div key={i} className={`animate-on-scroll feature-card`} style={{
              background: 'white', borderRadius: '14px', padding: '18px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
              display: 'flex', gap: '16px', alignItems: 'flex-start',
              transitionDelay: `${i * 0.08}s`
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: f.color, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '22px', flexShrink: 0
              }}>{f.icon}</div>
              <div>
                <p style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>{f.title}</p>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Niches */}
      <div style={{ padding: '50px 20px', background: '#f8fafc' }}>
        <div className="animate-on-scroll" style={{ textAlign: 'center', marginBottom: '28px' }}>
          <span style={{ background: '#dcfce7', color: '#16a34a', padding: '4px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '700' }}>WHO IT'S FOR</span>
          <h3 style={{ fontSize: '24px', fontWeight: '800', marginTop: '12px' }}>Built for your business type</h3>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px' }}>Custom categories loaded automatically</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxWidth: '420px', margin: '0 auto' }}>
          {[
            { icon: '🛒', label: 'Kirana / Grocery' },
            { icon: '💊', label: 'Medical / Pharmacy' },
            { icon: '🧵', label: 'Textile / Cloth' },
            { icon: '✂️', label: 'Salon / Beauty' },
            { icon: '🐐', label: 'Goat / Poultry Farm' },
            { icon: '🔧', label: 'Hardware Store' },
          ].map((n, i) => (
            <div key={i} className="animate-on-scroll niche-card" style={{
              background: 'white', padding: '18px 14px', borderRadius: '14px',
              textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              transitionDelay: `${i * 0.07}s`
            }}>
              <p style={{ fontSize: '32px', marginBottom: '8px' }}>{n.icon}</p>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{n.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ padding: '50px 20px' }}>
        <div className="animate-on-scroll" style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '700' }}>HOW IT WORKS</span>
          <h3 style={{ fontSize: '24px', fontWeight: '800', marginTop: '12px' }}>Up and running in 3 steps</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', maxWidth: '380px', margin: '0 auto' }}>
          {[
            { step: '1', title: 'Create your account', desc: 'Sign up in 2 minutes. Pick your business type.', icon: '📝' },
            { step: '2', title: 'Add your entries', desc: 'Record income and expenses as they happen.', icon: '➕' },
            { step: '3', title: 'See your profit', desc: 'Instant daily & monthly reports, always updated.', icon: '📈' },
          ].map((item, i) => (
            <div key={i} className="animate-on-scroll" style={{
              display: 'flex', gap: '16px', alignItems: 'flex-start',
              transitionDelay: `${i * 0.1}s`
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: '900', fontSize: '16px', flexShrink: 0
                }}>{item.step}</div>
                {i < 2 && <div style={{ width: '2px', height: '40px', background: '#e2e8f0', margin: '4px 0' }} />}
              </div>
              <div style={{ paddingTop: '10px', paddingBottom: i < 2 ? '20px' : '0' }}>
                <p style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>{item.icon} {item.title}</p>
                <p style={{ fontSize: '13px', color: '#64748b' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div style={{ padding: '50px 20px', background: '#f8fafc' }}>
        <div className="animate-on-scroll" style={{ textAlign: 'center', marginBottom: '28px' }}>
          <span style={{ background: '#dbeafe', color: '#2563eb', padding: '4px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '700' }}>PRICING</span>
          <h3 style={{ fontSize: '24px', fontWeight: '800', marginTop: '12px' }}>Simple, honest pricing</h3>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px' }}>No hidden charges. Cancel anytime.</p>
        </div>

        <div className="animate-on-scroll" style={{
          background: 'white', borderRadius: '20px', padding: '32px 24px',
          maxWidth: '340px', margin: '0 auto',
          boxShadow: '0 8px 32px rgba(37,99,235,0.15)',
          border: '2px solid #2563eb', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
            background: 'linear-gradient(90deg, #2563eb, #3b82f6, #2563eb)',
            backgroundSize: '200% 100%', animation: 'gradientShift 3s ease infinite'
          }} />

          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <p style={{ fontSize: '13px', fontWeight: '700', color: '#2563eb', marginBottom: '8px' }}>MONTHLY PLAN</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '2px' }}>
              <span style={{ fontSize: '20px', fontWeight: '700', color: '#64748b', paddingBottom: '8px' }}>₹</span>
              <span style={{ fontSize: '60px', fontWeight: '900', color: '#1e293b', lineHeight: 1 }}>499</span>
              <span style={{ fontSize: '16px', color: '#64748b', paddingBottom: '10px' }}>/mo</span>
            </div>
            <p style={{ color: '#16a34a', fontSize: '13px', fontWeight: '600', marginTop: '4px' }}>
              🎉 First 30 days completely free
            </p>
          </div>

          {[
            '✅ Unlimited income & expense entries',
            '✅ Customer udhaar tracker',
            '✅ WhatsApp payment reminders',
            '✅ Daily & monthly PDF reports',
            '✅ Custom categories for your business',
            '✅ Works on any Android phone',
            '✅ Free updates forever',
          ].map((item, i) => (
            <p key={i} style={{ fontSize: '14px', color: '#475569', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>{item}</p>
          ))}

          <Link to="/signup" className="cta-btn shimmer-btn" style={{
            display: 'block', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: 'white', padding: '16px', borderRadius: '12px',
            fontSize: '16px', fontWeight: '800', textAlign: 'center',
            marginTop: '20px', boxShadow: '0 4px 14px rgba(37,99,235,0.35)'
          }}>
            Start Free Trial →
          </Link>
        </div>
      </div>

      {/* Final CTA */}
      <div style={{
        background: 'linear-gradient(-45deg, #1e3a8a, #1d4ed8, #2563eb, #3b82f6)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 6s ease infinite',
        padding: '60px 20px', textAlign: 'center'
      }}>
        <div className="animate-on-scroll">
          <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'float 3s ease-in-out infinite' }}>🏪</div>
          <h3 style={{ fontSize: '28px', fontWeight: '900', color: 'white', marginBottom: '12px', lineHeight: '1.2' }}>
            Your shop deserves<br />better than a notebook
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '15px', marginBottom: '32px', maxWidth: '300px', margin: '0 auto 32px' }}>
            Join shop owners who track their business the smart way
          </p>
          <Link to="/signup" className="cta-btn" style={{
            background: 'white', color: '#2563eb',
            padding: '18px 40px', borderRadius: '14px',
            fontSize: '18px', fontWeight: '900',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            Get Started Free →
          </Link>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '16px' }}>
            No credit card · No commitment · Cancel anytime
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '24px 20px', background: '#0f172a', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
          <div style={{
            width: '28px', height: '28px', background: '#2563eb',
            borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ color: 'white', fontWeight: '900', fontSize: '14px' }}>₹</span>
          </div>
          <span style={{ color: 'white', fontWeight: '800', fontSize: '18px' }}>Laabh</span>
        </div>
        <p style={{ color: '#475569', fontSize: '13px' }}>© 2026 Laabh · Made with ❤️ for Indian shopkeepers</p>
        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <Link to="/login" style={{ color: '#475569', fontSize: '13px', textDecoration: 'none' }}>Login</Link>
          <Link to="/signup" style={{ color: '#475569', fontSize: '13px', textDecoration: 'none' }}>Sign Up</Link>
        </div>
      </div>

    </div>
  )
}