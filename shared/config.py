import os
from dotenv import load_dotenv


load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL"
)

KAFKA_BOOTSTRAP_SERVERS = os.getenv(
    "KAFKA_BOOTSTRAP_SERVERS"
)

REDIS_URL = os.getenv(
    "REDIS_URL"
)

KAFKA_TOPIC_WEBHOOKS = os.getenv(
    "KAFKA_TOPIC_WEBHOOKS"
)

MAX_RETRIES = int(
    os.getenv("MAX_RETRIES") or 3
)

MAX_CONCURRENT_JOBS = int(
    os.getenv(
        "MAX_CONCURRENT_JOBS"
    ) or 10
)