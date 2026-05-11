// components/ActivityFeed.jsx
import { getStatusCfg } from './StatusBadge'
import { formatRelative } from '../utils/formatters'
import { Activity, Zap } from 'lucide-react'

const ICONS = {
  SUCCESS:    '✓',
  DLQ:        '✕',
  RETRYING:   '↺',
  PROCESSING: '◌',
  QUEUED:     '·',
}

export default function ActivityFeed({ items }) {
  return (
    <div className="surface" style={{
      width: '272px',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      borderRadius: 'var(--radius-xl)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '16px 18px',
        borderBottom: '1px solid var(--border-dim)',
        flexShrink: 0,
      }}>
        <Activity size={14} color="var(--text-tertiary)" />
        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>
          Activity
        </span>
        {items.length > 0 && (
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '2px 7px',
            borderRadius: 99,
            background: 'var(--accent-muted)',
            color: 'var(--text-accent)',
            border: '1px solid var(--border-accent)',
          }}>
            {items.length}
          </span>
        )}
      </div>

      {/* Feed */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
        {items.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: 10,
            padding: '40px 24px',
          }}>
            <Zap size={28} color="var(--text-tertiary)" />
            <p style={{ fontSize: 12.5, color: 'var(--text-tertiary)', textAlign: 'center', lineHeight: 1.5 }}>
              Events will appear here as webhooks are processed
            </p>
          </div>
        ) : (
          items.map((item, i) => {
            const cfg = getStatusCfg(item.status)
            return (
              <div
                key={item.id}
                className="anim-slide-right"
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '10px 18px',
                  transition: 'background 0.12s',
                  cursor: 'default',
                  animationDelay: i === 0 ? '0ms' : '40ms',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Timeline line + dot */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flexShrink: 0,
                  paddingTop: 3,
                }}>
                  <div style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: cfg.bg,
                    border: `1px solid ${cfg.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                    color: cfg.color,
                    flexShrink: 0,
                  }}>
                    {ICONS[item.status] ?? '·'}
                  </div>
                  {/* Vertical connector */}
                  {i < items.length - 1 && (
                    <div style={{
                      width: 1,
                      flex: 1,
                      minHeight: 12,
                      background: 'var(--border-dim)',
                      marginTop: 4,
                    }} />
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0, paddingBottom: 6 }}>
                  <div style={{
                    fontSize: 12.5,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.45,
                    wordBreak: 'break-word',
                  }}>
                    {item.message}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                    {formatRelative(item.timestamp)}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
