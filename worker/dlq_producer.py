import logging
import json

from confluent_kafka import Producer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


config ={
    "bootstrap.servers": "kafka:9092"
}

producer = Producer(config)

def publish_to_dlq(event: dict):

    try:
        producer.produce(
            "jobs.dlq",
            json.dumps(event).encode("utf-8")
        )

        producer.flush()

        logger.warning(f"Job has been sent to the DLQ: {event['webhook_id']}")

    except Exception as e:
        logger.error(f"failed to publish the DLQ: {str(e)}")

        raise