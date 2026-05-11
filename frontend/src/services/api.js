// services/api.js — REST API integration
const BASE_URL = 'http://localhost:8000'

export const api = {
  async getWebhooks() {
    const res = await fetch(`${BASE_URL}/webhooks`)
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    return res.json()
  },

  async getWebhook(id) {
    const res = await fetch(`${BASE_URL}/webhooks/${id}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    return res.json()
  },

  async createWebhook({ webhook_url, event_type, payload }) {
    const res = await fetch(`${BASE_URL}/webhooks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhook_url, event_type, payload }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `HTTP ${res.status}`)
    }
    return res.json()
  },
}
