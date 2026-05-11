// components/Sidebar.jsx
import { LayoutDashboard, Webhook, Activity, BarChart3, Settings, Zap } from 'lucide-react'

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Webhook,         label: 'Webhooks',  active: false },
  { icon: Activity,        label: 'Activity',  active: false },
  { icon: BarChart3,       label: 'Metrics',   active: false },
]

const WS_STATES = {
  connected:    { dot: '#34d399', label: 'Connected', pulse: true },
  connecting:   { dot: '#fbbf24', label: 'Connecting', pulse: true },
  disconnected: { dot: '#64748b', label: 'Offline',    pulse: false },
  error:        { dot: '#f87171', label: 'Error',      pulse: false },
  failed:       { dot: '#f87171', label: 'Failed',     pulse: false },
}

export default function Sidebar({ wsStatus }) {
  const ws = WS_STATES[wsStatus] ?? WS_STATES.connecting

  return (
    <aside style={{
      width: '228px',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-dim)',
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 20px 18px',
        borderBottom: '1px solid var(--border-dim)',
        display: 'flex',
        alignItems: 'center',
        gap: '11px',
      }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          background: 'var(--accent-muted)',
          border: '1px solid var(--border-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Zap size={14} color="var(--text-accent)" />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            PulseQueue
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 1 }}>
            Webhook Delivery
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div className="text-label" style={{ padding: '2px 6px 10px', letterSpacing: '0.1em' }}>
          Navigation
        </div>
        {NAV.map(({ icon: Icon, label, active }) => (
          <button key={label} className={`nav-item${active ? ' active' : ''}`}>
            <Icon size={15} style={{ flexShrink: 0 }} />
            {label}
          </button>
        ))}
      </nav>

      {/* Footer — WS status */}
      <div style={{ padding: '14px 12px 18px', borderTop: '1px solid var(--border-dim)' }}>
        <div style={{
          padding: '10px 12px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-dim)',
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          marginBottom: 8,
        }}>
          <span style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: ws.dot,
            flexShrink: 0,
          }} className={ws.pulse ? 'anim-pulse-dot' : ''} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>
              WebSocket
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 1 }}>
              {ws.label}
            </div>
          </div>
        </div>
        <button className="nav-item" style={{ width: '100%' }}>
          <Settings size={15} />
          Settings
        </button>
      </div>
    </aside>
  )
}
