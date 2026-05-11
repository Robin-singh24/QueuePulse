// components/Header.jsx
import { Plus, RefreshCw, Wifi, WifiOff } from 'lucide-react'

export default function Header({ wsStatus, onRefresh, onOpenCreate, loading }) {
  const live = wsStatus === 'connected'

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 28px',
      borderBottom: '1px solid var(--border-dim)',
      background: 'var(--bg-surface)',
      flexShrink: 0,
    }}>
      {/* Title block */}
      <div>
        <h1 style={{
          fontSize: 17,
          fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          lineHeight: 1.3,
        }}>
          Webhook Dashboard
        </h1>
        <p style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 3 }}>
          Real-time delivery monitoring
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* WS badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-dim)',
          fontSize: 12.5,
          fontWeight: 500,
          color: live ? 'var(--green)' : 'var(--text-tertiary)',
        }}>
          {live
            ? <Wifi size={12} />
            : <WifiOff size={12} />
          }
          {live ? 'Live' : wsStatus}
        </div>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          className="btn btn-ghost"
          style={{ padding: '7px 14px', fontSize: 12.5 }}
        >
          <RefreshCw size={13} className={loading ? 'anim-spin' : ''} />
          Refresh
        </button>

        {/* New Webhook */}
        <button
          onClick={onOpenCreate}
          className="btn btn-primary"
          style={{ padding: '7px 16px', fontSize: 13 }}
        >
          <Plus size={14} />
          New Webhook
        </button>
      </div>
    </header>
  )
}
