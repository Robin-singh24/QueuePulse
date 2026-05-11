// pages/Dashboard.jsx
import { useState } from 'react'
import {
  Activity,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Webhook,
} from 'lucide-react'

import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import MetricCard from '../components/MetricCard'
import WebhookTable from '../components/WebhookTable'
import ActivityFeed from '../components/ActivityFeed'
import CreateWebhookModal from '../components/CreateWebhookModal'
import { useWebhooks } from '../hooks/useWebhooks'

const METRIC_CARDS = [
  {
    key: 'total',
    label: 'Total Events',
    icon: Webhook,
    color: 'indigo',
    description: 'All webhook events queued',
  },
  {
    key: 'success',
    label: 'Successful',
    icon: CheckCircle2,
    color: 'emerald',
    description: 'Delivered successfully',
  },
  {
    key: 'failed',
    label: 'Dead Letters',
    icon: XCircle,
    color: 'red',
    description: 'Moved to DLQ after max retries',
  },
  {
    key: 'retries',
    label: 'Total Retries',
    icon: RefreshCw,
    color: 'amber',
    description: 'Cumulative retry attempts',
  },
]

export default function Dashboard() {
  const {
    webhooks,
    metrics,
    loading,
    error,
    wsStatus,
    activityFeed,
    refresh,
    addWebhook,
  } = useWebhooks()

  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div
      className="flex h-full w-full overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Sidebar */}
      <Sidebar wsStatus={wsStatus} />

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <Header
          wsStatus={wsStatus}
          onRefresh={refresh}
          onOpenCreate={() => setModalOpen(true)}
          loading={loading}
        />

        {/* Scrollable content */}
        <main className="flex-1 overflow-auto p-6 min-h-0">
          {/* Metrics row */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {METRIC_CARDS.map((card, i) => (
              <div
                key={card.key}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <MetricCard
                  label={card.label}
                  value={metrics[card.key]}
                  icon={card.icon}
                  color={card.color}
                  description={card.description}
                  loading={loading && metrics[card.key] === 0}
                />
              </div>
            ))}
          </div>

          {/* Table + Activity feed row */}
          <div
            className="flex gap-4"
            style={{ height: 'calc(100vh - 260px)', minHeight: '400px' }}
          >
            {/* Webhook table — takes remaining space */}
            <div className="flex-1 min-w-0 flex flex-col">
              <WebhookTable
                webhooks={webhooks}
                loading={loading}
                error={error}
                onRefresh={refresh}
              />
            </div>

            {/* Activity feed — fixed width */}
            <ActivityFeed items={activityFeed} />
          </div>
        </main>
      </div>

      {/* Create modal */}
      <CreateWebhookModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(webhook) => {
          addWebhook(webhook)
          setModalOpen(false)
        }}
      />
    </div>
  )
}
