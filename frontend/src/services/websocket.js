// services/websocket.js — WebSocket client with reconnect logic
const WS_URL = 'ws://localhost:8000/ws/webhooks'
const RECONNECT_DELAY_MS = 3000
const MAX_RECONNECT_ATTEMPTS = 10

export function createWebSocketClient({ onMessage, onStatusChange }) {
  let ws = null
  let reconnectAttempts = 0
  let reconnectTimer = null
  let destroyed = false

  function connect() {
    if (destroyed) return

    try {
      ws = new WebSocket(WS_URL)
      onStatusChange('connecting')

      ws.onopen = () => {
        reconnectAttempts = 0
        onStatusChange('connected')
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          onMessage(data)
        } catch (e) {
          console.warn('[WS] Failed to parse message:', event.data)
        }
      }

      ws.onclose = () => {
        if (destroyed) return
        onStatusChange('disconnected')
        scheduleReconnect()
      }

      ws.onerror = () => {
        onStatusChange('error')
      }
    } catch (e) {
      onStatusChange('error')
      scheduleReconnect()
    }
  }

  function scheduleReconnect() {
    if (destroyed) return
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      onStatusChange('failed')
      return
    }
    reconnectAttempts++
    const delay = RECONNECT_DELAY_MS * Math.min(reconnectAttempts, 5)
    reconnectTimer = setTimeout(() => {
      if (!destroyed) connect()
    }, delay)
  }

  function destroy() {
    destroyed = true
    clearTimeout(reconnectTimer)
    if (ws) {
      ws.onclose = null
      ws.onerror = null
      ws.close()
      ws = null
    }
  }

  connect()
  return { destroy }
}
