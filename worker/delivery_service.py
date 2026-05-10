#worker/delivary_service.py
import logging

import httpx


logging.basicConfig(level=logging.INFO)

logger = logging.getLogger(__name__)

async def deliver_webhook(webhook_url: str,payload: dict):
    try:
        async with httpx.AsyncClient() as client:

            response = await client.post(
                webhook_url,
                json=payload,
                timeout=10
            )

        response.raise_for_status()

        logger.info(
            f"Webhook delivered successfully "
            f"to {webhook_url}"
        )

        return True

    except Exception as e:

        logger.error(
            f"Webhook delivery failed: {str(e)}"
        )

        raise