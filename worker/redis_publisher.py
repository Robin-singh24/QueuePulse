import json
import logging

import redis.asyncio as redis

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


redis_client = redis.Redis(
    host="redis",
    port=6379,
    decode_responses=True
)

CHANNEL_NAME = "job_updates"

async def publish_job_updates(event: dict):
    try:
        await redis_client.publish(
            CHANNEL_NAME,
            json.dumps(event)
        )

        logger.info(f"Published realtime update: {event}")

    except Exception as e:
        logger.error(f"Failed Redis publish: {str(e)}")