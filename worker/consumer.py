import json
import time
import asyncio
import logging

from confluent_kafka import KafkaException,Consumer
from sqlalchemy import update
from prometheus_client import start_http_server


from worker.delivery_service import deliver_webhook
from worker.db import AsyncSessionLocal
from api.db.models import WebhookEvent
from worker.dlq_producer import publish_to_dlq
from worker.redis_publisher import publish_job_updates
from api.services.metrics import (
    job_processing_duration,
    job_retries_total,
    jobs_failed_total,
    jobs_processed_total
)

from shared.config import (
    MAX_RETRIES,
    MAX_CONCURRENT_JOBS,
    KAFKA_BOOTSTRAP_SERVERS,
    KAFKA_TOPIC_WEBHOOKS
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


config = {
    'bootstrap.servers': KAFKA_BOOTSTRAP_SERVERS,
    'group.id': 'pulsequeue-workers',
    'auto.offset.reset': 'earliest'
}

consumer = Consumer(config)

consumer.subscribe([KAFKA_TOPIC_WEBHOOKS])

semaphore = asyncio.Semaphore(
    MAX_CONCURRENT_JOBS
)

async def update_webhook_status(
    webhook_id: str,
    status: str,
    retry_count: int =0,
    error_message: str = None 
):
    async with AsyncSessionLocal() as db:
        try:
            stmt = (
                update(WebhookEvent)
                .where(WebhookEvent.id == webhook_id)
                .values(
                    status=status,
                    retry_count=retry_count,
                    error_message=error_message
                )
            )
            await db.execute(stmt)

            await db.commit()

            await publish_job_updates({
                "webhook_id" : webhook_id,
                "status": status,
                "retry_count": retry_count,
                "error_message": error_message
            })

            logger.info(
                f"Updated webhook {webhook_id} -> {status}"
            )
        except Exception as e:
            await db.rollback()

            logger.error(
                f"Failed DB update for {webhook_id}: {str(e)}"
            )


async def process_webhook(event: dict):
    
    webhook_id = event['webhook_id']

    retry_count = int(event.get("retry_count", 0))

    start_time = time.time()
    
    while retry_count <= MAX_RETRIES:
        try:
            await update_webhook_status(
                webhook_id,
                "PROCESSING",
                retry_count
            )

            logger.info(
                f"Delivering webhook event: "
                f"{webhook_id}"
            )

            await deliver_webhook(
                webhook_url=event["webhook_url"],
                payload=event["payload"]
            )

            await update_webhook_status(
                webhook_id,
                "SUCCESS",
                retry_count
            )

            jobs_processed_total.inc()
            job_processing_duration.observe(
                time.time() - start_time
            )

            logger.info(
                f"Webhook delivered successfully: {webhook_id}"
            )
            return
        
        except Exception as e:
            logger.error(f"Webhook delivery failed for {webhook_id} : {str(e)}")

            if retry_count < MAX_RETRIES:
                retry_count += 1
                job_retries_total.inc()
                
                backoff_time = 2 ** retry_count

                await update_webhook_status(
                    webhook_id,
                    "RETRYING",
                    retry_count,
                    str(e)
                )

                logger.warning(
                    f"Retrying webhook {webhook_id} "
                    f"in {backoff_time}s "
                    f"(attempt {retry_count})"
                )

                await asyncio.sleep(backoff_time)

                continue
            
            await update_webhook_status(
                webhook_id,
                "DLQ",
                retry_count,
                str(e)
            )
            jobs_failed_total.inc()

            event["final_error"] = str(e)
            publish_to_dlq(event)
            logger.critical(
                f"Job moved to DLQ: {webhook_id}"
            )
            return

async def process_with_semaphore(
    event: dict
):

    async with semaphore:

        await process_webhook(event)

async def main():

    try:
        start_http_server(9000)
        logger.info("Kafka consumer started")

        while True:

            msg = consumer.poll(1.0)

            if msg is None:
                continue

            if msg.error():
                raise KafkaException(msg.error())

            event = json.loads(
                msg.value().decode("utf-8")
            )

            logger.info(
                f"Received event: {event}"
            )

            asyncio.create_task(
                process_with_semaphore(event)
            )

    except KeyboardInterrupt:

        logger.info("Consumer stopped manually")

    except Exception as e:

        logger.error(
            f"Consumer crashed: {str(e)}"
        )

    finally:

        consumer.close()

        logger.info("Kafka consumer closed")


if __name__ == "__main__":

    asyncio.run(main())