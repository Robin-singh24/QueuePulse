from prometheus_client import Counter, Histogram, Gauge

jobs_processed_total = Counter(
    "jobs_processed_total",
    "Total successfully processed jobs"
)

jobs_failed_total = Counter(
    "jobs_failed_total",
    "Total failed jobs"
)

job_retries_total = Counter(
    "job_retries_total",
    "Total retried jobs"
)

job_processing_duration = Histogram(
    "job_processing_duration_seconds",
    "Job processing duration"
)

active_websocket_connections = Gauge(
    "active_websocket_connections",
    "Current active websocket clients"
)