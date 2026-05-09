from confluent_kafka import KafkaException
import logging
import logging
import time
import json
import random

from confluent_kafka import Consumer

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

def process_job(event: dict):
    
    job_id = event['job_id']

    retry_count = int(event.get("retry_count", 0))

    try:
        logger.info(f"Processing job : {job_id}")
        time.sleep(random.uniform(2,5))

        if random.random() < 0.4:
            raise Exception("Simulated processing failure")
        
        logger.info(f"Job processed successfully: {job_id}")

    except Exception as e:
        logger.error(f"Job processing failed for {job_id} : {str(e)}")

        if retry_count < MAX_RETRIES:
            retry_count += 1
            
            backoff_time = 2 ** retry_count

            logger.warning(
                f"Retrying job {job_id} "
                f"in {backoff_time}s "
                f"(attempt {retry_count})"
            )

            time.sleep(backoff_time)

            event["retry_count"] = retry_count
            process_job(event)
        
        else:
            logger.critical(
                f"Job moved to DLQ: {job_id}"
            )


try:
    logger.info("Kafka consumer started")

    while True:
        msg = consumer.poll(1.0)

        if msg is None:
            continue

        if msg.error():
            raise KafkaException(msg.error())

        event = json.loads(msg.value().decode("utf-8"))

        logger.info(f"Received event: {event}")

        process_job(event)  

except KeyboardInterrupt:

    logger.info("Consumer stopped manually")

except Exception as e:

    logger.error(f"Consumer crashed: {str(e)}")

finally:

    consumer.close()

    logger.info("Kafka consumer closed")