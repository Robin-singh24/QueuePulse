// components/MetricCard.jsx
const COLORS = {
  indigo: {
    icon: 'var(--text-accent)',
    bg: 'var(--accent-muted)',
    border: 'var(--border-accent)',
    value: 'var(--text-primary)',
  },
  green: {
    icon: 'var(--green)',
    bg: 'var(--green-muted)',
    border: 'var(--green-border)',
    value: 'var(--text-primary)',
  },
  red: {
    icon: 'var(--red)',
    bg: 'var(--red-muted)',
    border: 'var(--red-border)',
    value: 'var(--text-primary)',
  },
  amber: {
    icon: 'var(--amber)',
    bg: 'var(--amber-muted)',
    border: 'var(--amber-border)',
    value: 'var(--text-primary)',
  },
}

export default function MetricCard({ label, value, icon: Icon, color = 'indigo', description, loading }) {
  const c = COLORS[color] ?? COLORS.indigo

  return (
    <div
      className="surface surface-hover anim-fade-up"
      style={{ padding: '22px 24px', cursor: 'default', minWidth: 0 }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="text-label" style={{ marginBottom: 10 }}>{label}</div>
          {loading ? (
            <div className="skeleton" style={{ height: 34, width: 60 }} />
          ) : (
            <div style={{
              fontSize: 32,
              fontWeight: 700,
              color: c.value,
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}>
              {value?.toLocaleString() ?? '—'}
            </div>
          )}
        </div>

        <div style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: c.bg,
          border: `1px solid ${c.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={17} color={c.icon} />
        </div>
      </div>

      {/* Description */}
      <div style={{
        fontSize: 12,
        color: 'var(--text-tertiary)',
        marginTop: 16,
        lineHeight: 1.4,
      }}>
        {description}
      </div>
    </div>
  )
}
