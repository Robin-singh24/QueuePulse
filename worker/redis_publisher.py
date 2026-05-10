import json
import logging

import redis.asyncio as redis

from shared.config import REDIS_URL

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


REDIS_CLIENT = redis.from_url(
    REDIS_URL,
    decode_responses=True
)

CHANNEL_NAME = "job_updates"

async def publish_job_updates(event: dict):
    try:
        await REDIS_CLIENT.publish(
            CHANNEL_NAME,
            json.dumps(event)
        )

        logger.info(f"Published realtime update: {event}")

    except Exception as e:
        logger.error(f"Failed Redis publish: {str(e)}")