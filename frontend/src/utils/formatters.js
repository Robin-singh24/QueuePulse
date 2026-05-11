// utils/formatters.js
import { format, formatDistanceToNow } from 'date-fns'

export function formatTimestamp(ts) {
  if (!ts) return '—'
  try {
    return format(new Date(ts), 'MMM d, HH:mm:ss')
  } catch {
    return ts
  }
}

export function formatRelative(ts) {
  if (!ts) return '—'
  try {
    return formatDistanceToNow(new Date(ts), { addSuffix: true })
  } catch {
    return ts
  }
}

export function shortId(id) {
  if (!id) return '—'
  return id.slice(0, 8) + '…'
}

export function truncate(str, len = 32) {
  if (!str) return '—'
  return str.length > len ? str.slice(0, len) + '…' : str
}
