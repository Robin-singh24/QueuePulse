import json
import asyncio
import logging

import redis.asyncio as redis

from api.websocket.manager import manager
from shared.config import REDIS_URL

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


redis_client = redis.from_url(
    REDIS_URL,
    decode_responses=True
)

CHANNEL_NAME = "job_updates"

async def redis_subscriber():
    try:
        pubsub = redis_client.pubsub()

        await pubsub.subscribe(CHANNEL_NAME)
        logger.info(f"Subscribered to: {CHANNEL_NAME}")

        while True:
            message = await pubsub.get_message(
                ignore_subscribe_messages=True,
                timeout=1.0
            )

            if message:
                data = json.loads(message["data"])
                logger.info(
                    f"Broadcasting websocket event: {data}"
                )

                await manager.broadcast(data)
            await asyncio.sleep(0.1)

    except Exception as e:
        logger.error(
            f"Redis subscriber failed: {str(e)}"
        )