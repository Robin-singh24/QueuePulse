import json
import time
import random
import asyncio
import logging

from confluent_kafka import KafkaException,Consumer
from sqlalchemy import update


from worker.db import AsyncSessionLocal
from api.db.models import Job
from worker.

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


config = {
    'bootstrap.servers': 'kafka:9092',
    'group.id': 'pulsequeue-workers',
    'auto.offset.reset': 'earliest'
}

consumer = Consumer(config)

consumer.subscribe(["jobs.created"])

MAX_RETRIES = 3

async def updated_job_status(
    job_id: str,
    status: str,
    retry_count: int =0,
    error_message: str = None 
):
    async with AsyncSessionLocal() as db:
        try:
            stmt = (
                update(Job)
                .where(Job.id == job_id)
                .values(
                    status=status,
                    retry_count=retry_count,
                    error_message=error_message
                )
            )
            await db.execute(stmt)

            await db.commit()

            logger.info(
                f"Updated job {job_id} -> {status}"
            )
        except Exception as e:
            await db.rollback()

            logger.error(
                f"Failed DB update for {job_id}: {str(e)}"
            )


async def process_job(event: dict):
    
    job_id = event['job_id']

    retry_count = int(event.get("retry_count", 0))

    try:
        await updated_job_status(
            job_id,
            "PROCESSING",
            retry_count
        )

        logger.info(f"Processing job: {job_id}")
        await asyncio.sleep(3)

        if random.random() < 0.4:
            raise Exception("Simulated processing failure")

        await updated_job_status(
            job_id,
            "SUCCESS",
            retry_count
        )

        logger.info(
            f"Job processed successfully: {job_id}"
        )

    except Exception as e:
        logger.error(f"Job processing failed for {job_id} : {str(e)}")

        if retry_count < MAX_RETRIES:
            retry_count += 1
            
            backoff_time = 2 ** retry_count

            await updated_job_status(
                job_id,
                "RETRYING",
                retry_count,
                str(e)
            )

            logger.warning(
                f"Retrying job {job_id} "
                f"in {backoff_time}s "
                f"(attempt {retry_count})"
            )

            await asyncio.sleep(backoff_time)

            event["retry_count"] = retry_count

            await process_job(event)
        
        else:
            await updated_job_status(
                job_id,
                "DLQ",
                retry_count,
                str(e)
            )
            logger.critical(
                f"Job moved to DLQ: {job_id}"
            )


async def main():

    try:

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

            await process_job(event)

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