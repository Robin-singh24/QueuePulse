// utils/statusConfig.js — centralized status display config
export const STATUS_CONFIG = {
  QUEUED: {
    label: 'Queued',
    color: 'text-slate-400',
    bg: 'bg-slate-400/10',
    border: 'border-slate-400/20',
    dot: 'bg-slate-400',
    glow: '',
  },
  PROCESSING: {
    label: 'Processing',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
    dot: 'bg-blue-400',
    glow: 'animate-pulse-glow',
  },
  SUCCESS: {
    label: 'Success',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/20',
    dot: 'bg-emerald-400',
    glow: '',
  },
  RETRYING: {
    label: 'Retrying',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/20',
    dot: 'bg-amber-400',
    glow: 'animate-pulse-glow',
  },
  DLQ: {
    label: 'DLQ',
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/20',
    dot: 'bg-red-400',
    glow: '',
  },
}

export function getStatusConfig(status) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.QUEUED
}

export const ACTIVITY_MESSAGES = {
  SUCCESS: (id) => `Webhook delivered successfully — ${id?.slice(0, 8)}`,
  RETRYING: (id) => `Retry triggered — ${id?.slice(0, 8)}`,
  DLQ: (id) => `Moved to Dead Letter Queue — ${id?.slice(0, 8)}`,
  PROCESSING: (id) => `Processing webhook — ${id?.slice(0, 8)}`,
  QUEUED: (id) => `Webhook queued — ${id?.slice(0, 8)}`,
}
