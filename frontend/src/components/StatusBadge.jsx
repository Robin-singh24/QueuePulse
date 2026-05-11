// components/StatusBadge.jsx
const STATUS = {
  QUEUED: {
    label: 'Queued',
    color: 'var(--slate)',
    bg: 'var(--slate-muted)',
    border: 'var(--slate-border)',
    dot: 'var(--slate)',
    pulse: false,
  },
  PROCESSING: {
    label: 'Processing',
    color: 'var(--blue)',
    bg: 'var(--blue-muted)',
    border: 'var(--blue-border)',
    dot: 'var(--blue)',
    pulse: true,
  },
  SUCCESS: {
    label: 'Success',
    color: 'var(--green)',
    bg: 'var(--green-muted)',
    border: 'var(--green-border)',
    dot: 'var(--green)',
    pulse: false,
  },
  RETRYING: {
    label: 'Retrying',
    color: 'var(--amber)',
    bg: 'var(--amber-muted)',
    border: 'var(--amber-border)',
    dot: 'var(--amber)',
    pulse: true,
  },
  DLQ: {
    label: 'DLQ',
    color: 'var(--red)',
    bg: 'var(--red-muted)',
    border: 'var(--red-border)',
    dot: 'var(--red)',
    pulse: false,
  },
}

export default function StatusBadge({ status }) {
  const cfg = STATUS[status] ?? STATUS.QUEUED
  return (
    <span className="badge" style={{
      color: cfg.color,
      background: cfg.bg,
      borderColor: cfg.border,
    }}>
      <span
        className={`badge-dot${cfg.pulse ? ' anim-pulse-dot' : ''}`}
        style={{ background: cfg.dot }}
      />
      {cfg.label}
    </span>
  )
}

export function getStatusCfg(status) {
  return STATUS[status] ?? STATUS.QUEUED
}
