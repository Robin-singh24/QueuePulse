// hooks/useCreateWebhook.js — hook for creating webhooks
import { useState } from 'react'
import { api } from '../services/api'

const INITIAL_FORM = {
  webhook_url: '',
  event_type: '',
  payload: '{\n  "key": "value"\n}',
}

export function useCreateWebhook({ onSuccess } = {}) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  function setField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
    setError(null)
  }

  function reset() {
    setForm(INITIAL_FORM)
    setError(null)
    setSuccess(false)
  }

  async function submit() {
    setError(null)
    setSuccess(false)

    // Validate
    if (!form.webhook_url.trim()) {
      setError('Webhook URL is required')
      return
    }
    if (!form.event_type.trim()) {
      setError('Event type is required')
      return
    }

    let parsedPayload
    try {
      parsedPayload = JSON.parse(form.payload)
    } catch {
      setError('Payload must be valid JSON')
      return
    }

    setLoading(true)
    try {
      const result = await api.createWebhook({
        webhook_url: form.webhook_url.trim(),
        event_type: form.event_type.trim(),
        payload: parsedPayload,
      })
      setSuccess(true)
      onSuccess?.({
        id: result.webhook_id,
        webhook_id: result.webhook_id,
        webhook_url: form.webhook_url.trim(),
        event_type: form.event_type.trim(),
        payload: JSON.stringify(parsedPayload),
        status: 'QUEUED',
        retry_count: 0,
        created_at: new Date().toISOString(),
      })
      setTimeout(() => {
        reset()
      }, 1200)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return { form, setField, submit, loading, error, success, reset }
}
