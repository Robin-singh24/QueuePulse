// hooks/useWebhooks.js — main data hook: REST + WebSocket
import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../services/api'
import { createWebSocketClient } from '../services/websocket'
import { ACTIVITY_MESSAGES } from '../utils/statusConfig'

const MAX_ACTIVITY_ITEMS = 50

export function useWebhooks() {
  const [webhooks, setWebhooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [wsStatus, setWsStatus] = useState('connecting')
  const [activityFeed, setActivityFeed] = useState([])
  const wsRef = useRef(null)

  // Compute metrics from webhooks array
  const metrics = {
    total: webhooks.length,
    success: webhooks.filter(w => w.status === 'SUCCESS').length,
    failed: webhooks.filter(w => w.status === 'DLQ').length,
    retries: webhooks.reduce((acc, w) => acc + (w.retry_count || 0), 0),
  }

  // Add activity event to feed
  const pushActivity = useCallback((event) => {
    const msgFn = ACTIVITY_MESSAGES[event.status]
    const message = msgFn ? msgFn(event.webhook_id) : `Event: ${event.status}`
    const item = {
      id: `${event.webhook_id}-${Date.now()}`,
      webhook_id: event.webhook_id,
      status: event.status,
      message,
      timestamp: new Date().toISOString(),
    }
    setActivityFeed(prev => [item, ...prev].slice(0, MAX_ACTIVITY_ITEMS))
  }, [])

  // Handle incoming WebSocket message
  const handleWsMessage = useCallback((data) => {
    setWebhooks(prev => {
      const idx = prev.findIndex(w => w.id === data.webhook_id)
      if (idx === -1) return prev
      const updated = [...prev]
      updated[idx] = {
        ...updated[idx],
        status: data.status,
        retry_count: data.retry_count ?? updated[idx].retry_count,
        error_message: data.error_message ?? updated[idx].error_message,
        _updated: Date.now(), // triggers row animation
      }
      return updated
    })
    pushActivity(data)
  }, [pushActivity])

  // Initial fetch
  const fetchWebhooks = useCallback(async () => {
    try {
      setError(null)
      const data = await api.getWebhooks()
      setWebhooks(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Add a new webhook optimistically to the top of the list
  const addWebhook = useCallback((webhook) => {
    setWebhooks(prev => [{ ...webhook, _new: true }, ...prev])
    pushActivity({ webhook_id: webhook.webhook_id || webhook.id, status: 'QUEUED' })
  }, [pushActivity])

  useEffect(() => {
    fetchWebhooks()

    wsRef.current = createWebSocketClient({
      onMessage: handleWsMessage,
      onStatusChange: setWsStatus,
    })

    return () => {
      wsRef.current?.destroy()
    }
  }, [fetchWebhooks, handleWsMessage])

  return {
    webhooks,
    metrics,
    loading,
    error,
    wsStatus,
    activityFeed,
    refresh: fetchWebhooks,
    addWebhook,
  }
}
