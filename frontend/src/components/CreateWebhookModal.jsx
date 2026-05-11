// components/CreateWebhookModal.jsx
import { X, Send, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { useCreateWebhook } from '../hooks/useCreateWebhook'

const QUICK_EVENTS = ['payment.completed', 'order.shipped', 'user.registered']

export default function CreateWebhookModal({ open, onClose, onCreated }) {
  const { form, setField, submit, loading, error, success } = useCreateWebhook({
    onSuccess: (webhook) => {
      onCreated?.(webhook)
      setTimeout(onClose, 900)
    },
  })

  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div
        className="anim-fade-up"
        style={{
          width: '100%',
          maxWidth: 500,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.65)',
          overflow: 'hidden',
        }}
      >
        {/* Modal header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '22px 24px 18px',
          borderBottom: '1px solid var(--border-dim)',
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Create Webhook
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 4 }}>
              Dispatch a new event to the delivery queue
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ padding: '5px 8px', marginTop: -2, marginRight: -4 }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Form body */}
        <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* URL */}
          <div>
            <label style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: 7,
              letterSpacing: '0.01em',
            }}>
              Webhook URL <span style={{ color: 'var(--red)' }}>*</span>
            </label>
            <input
              type="url"
              className="input font-mono"
              placeholder="https://your-server.com/webhook"
              value={form.webhook_url}
              onChange={e => setField('webhook_url', e.target.value)}
              disabled={loading || success}
            />
          </div>

          {/* Event Type */}
          <div>
            <label style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: 7,
              letterSpacing: '0.01em',
            }}>
              Event Type <span style={{ color: 'var(--red)' }}>*</span>
            </label>
            <input
              type="text"
              className="input font-mono"
              placeholder="payment.completed"
              value={form.event_type}
              onChange={e => setField('event_type', e.target.value)}
              disabled={loading || success}
              list="event-suggestions"
            />
            <datalist id="event-suggestions">
              {QUICK_EVENTS.map(e => <option key={e} value={e} />)}
            </datalist>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              {QUICK_EVENTS.map(ev => (
                <button
                  key={ev}
                  onClick={() => setField('event_type', ev)}
                  disabled={loading || success}
                  style={{
                    fontSize: 11.5,
                    padding: '3px 9px',
                    borderRadius: 99,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-tertiary)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono, monospace)',
                    transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--accent-muted)'
                    e.currentTarget.style.color = 'var(--text-accent)'
                    e.currentTarget.style.borderColor = 'var(--border-accent)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                    e.currentTarget.style.color = 'var(--text-tertiary)'
                    e.currentTarget.style.borderColor = 'var(--border-subtle)'
                  }}
                >
                  {ev}
                </button>
              ))}
            </div>
          </div>

          {/* Payload */}
          <div>
            <label style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: 7,
              letterSpacing: '0.01em',
            }}>
              Payload <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(JSON)</span>
            </label>
            <textarea
              rows={5}
              className="input font-mono"
              placeholder='{ "key": "value" }'
              value={form.payload}
              onChange={e => setField('payload', e.target.value)}
              disabled={loading || success}
              spellCheck={false}
              style={{ lineHeight: 1.65 }}
            />
          </div>

          {/* Error / Success feedback */}
          {error && (
            <div
              className="anim-fade-up"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--red-muted)',
                border: '1px solid var(--red-border)',
                fontSize: 13,
                color: 'var(--red)',
              }}
            >
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          {success && (
            <div
              className="anim-fade-up"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--green-muted)',
                border: '1px solid var(--green-border)',
                fontSize: 13,
                color: 'var(--green)',
              }}
            >
              <CheckCircle size={14} />
              Webhook queued successfully!
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 10,
          padding: '14px 24px',
          borderTop: '1px solid var(--border-dim)',
        }}>
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={submit}
            disabled={loading || success}
          >
            {loading
              ? <><Loader size={13} className="anim-spin" /> Queuing…</>
              : success
                ? <><CheckCircle size={13} /> Queued!</>
                : <><Send size={13} /> Queue Webhook</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}
