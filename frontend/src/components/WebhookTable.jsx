// components/WebhookTable.jsx
import { useRef, useEffect } from 'react'
import StatusBadge from './StatusBadge'
import { shortId, formatTimestamp, truncate } from '../utils/formatters'
import { RefreshCw, Inbox } from 'lucide-react'

const COLS = [
  { key: 'id',          label: 'Webhook ID',  w: '148px' },
  { key: 'event_type',  label: 'Event Type',  w: '160px' },
  { key: 'webhook_url', label: 'Target URL',  w: 'auto'  },
  { key: 'status',      label: 'Status',      w: '120px' },
  { key: 'retry_count', label: 'Retries',     w: '80px'  },
  { key: 'created_at',  label: 'Created',     w: '148px' },
]

function SkeletonRow() {
  return (
    <tr className="table-row">
      {COLS.map(col => (
        <td key={col.key} style={{ padding: '14px 18px' }}>
          <div className="skeleton" style={{ height: 14, width: col.key === 'status' ? 72 : '70%' }} />
        </td>
      ))}
    </tr>
  )
}

function EmptyState() {
  return (
    <tr>
      <td colSpan={COLS.length}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '72px 24px',
          gap: 12,
        }}>
          <Inbox size={36} color="var(--text-tertiary)" />
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>
            No events yet
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', textAlign: 'center', maxWidth: 280 }}>
            Create a webhook to see real-time delivery events appear here
          </div>
        </div>
      </td>
    </tr>
  )
}

export default function WebhookTable({ webhooks, loading, error, onRefresh }) {
  const rowRefs = useRef({})
  const knownIds = useRef(new Set())

  useEffect(() => {
    webhooks.forEach(w => {
      if (!knownIds.current.has(w.id)) {
        const el = rowRefs.current[w.id]
        if (el) {
          el.classList.remove('anim-row-flash')
          void el.offsetWidth
          el.classList.add('anim-row-flash')
        }
      }
    })
    knownIds.current = new Set(webhooks.map(w => w.id))
  }, [webhooks])

  return (
    <div className="surface" style={{
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      flex: 1,
      minHeight: 0,
      borderRadius: 'var(--radius-xl)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-dim)',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>
            Live Events
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
            {webhooks.length} event{webhooks.length !== 1 ? 's' : ''}
          </div>
        </div>
        <button className="btn btn-ghost" onClick={onRefresh} style={{ padding: '6px 13px', fontSize: 12 }}>
          <RefreshCw size={12} className={loading ? 'anim-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: '10px 20px',
          fontSize: 12.5,
          color: 'var(--red)',
          background: 'var(--red-muted)',
          borderBottom: '1px solid var(--red-border)',
          flexShrink: 0,
        }}>
          ⚠ Cannot reach backend — {error}
        </div>
      )}

      {/* Table */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-elevated)' }}>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              {COLS.map(col => (
                <th key={col.key} style={{
                  width: col.w,
                  textAlign: 'left',
                  padding: '11px 18px',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  color: 'var(--text-tertiary)',
                  whiteSpace: 'nowrap',
                }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && webhooks.length === 0
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              : webhooks.length === 0
                ? <EmptyState />
                : webhooks.map(webhook => (
                    <tr
                      key={webhook.id}
                      ref={el => (rowRefs.current[webhook.id] = el)}
                      className="table-row"
                    >
                      {/* ID */}
                      <td style={{ padding: '13px 18px' }}>
                        <span
                          className="font-mono"
                          style={{
                            fontSize: 12,
                            color: 'var(--text-accent)',
                            background: 'var(--accent-muted)',
                            border: '1px solid var(--border-accent)',
                            padding: '2px 7px',
                            borderRadius: 5,
                            cursor: 'default',
                            display: 'inline-block',
                          }}
                          title={webhook.id}
                        >
                          {shortId(webhook.id)}
                        </span>
                      </td>

                      {/* Event Type */}
                      <td style={{ padding: '13px 18px' }}>
                        <span
                          className="font-mono"
                          style={{
                            fontSize: 12,
                            color: 'var(--text-secondary)',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid var(--border-dim)',
                            padding: '2px 7px',
                            borderRadius: 5,
                            display: 'inline-block',
                          }}
                        >
                          {webhook.event_type || '—'}
                        </span>
                      </td>

                      {/* URL */}
                      <td style={{ padding: '13px 18px', overflow: 'hidden' }}>
                        <span
                          style={{
                            fontSize: 12.5,
                            color: 'var(--text-tertiary)',
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={webhook.webhook_url}
                        >
                          {webhook.webhook_url || '—'}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '13px 18px' }}>
                        <StatusBadge status={webhook.status} />
                      </td>

                      {/* Retries */}
                      <td style={{ padding: '13px 18px' }}>
                        <span style={{
                          fontSize: 13,
                          fontWeight: 500,
                          fontFamily: 'var(--font-mono)',
                          color: webhook.retry_count > 0 ? 'var(--amber)' : 'var(--text-tertiary)',
                        }}>
                          {webhook.retry_count ?? 0}
                        </span>
                      </td>

                      {/* Created */}
                      <td style={{ padding: '13px 18px' }}>
                        <span style={{ fontSize: 12.5, color: 'var(--text-tertiary)' }}>
                          {formatTimestamp(webhook.created_at)}
                        </span>
                      </td>
                    </tr>
                  ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}
