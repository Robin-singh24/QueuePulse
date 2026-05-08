import logging
import json
from confluent_kafka import Producer 

logger = logging.getLogger()

config={
    "bootstrap.servers": "kafka:9092"
}

producer = Producer(config)

def delivery_report(err,msg):
    if err is not None:
        logger.error(f"Delivery failed {err}")
    else:
        logger.info(
            f"Message delivered successfully to {msg.topic() [{msg.partition()}]}"
        )
    

def publish_job(topic: str, data:dict):

    producer.produce(
        topic,
        json.dumps(data).encode("utf-8"),
        callback=delivery_report
    )

    producer.flush()