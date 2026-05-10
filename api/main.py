import uuid
import logging
import asyncio
import json

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Depends

from api.schemas.webhook_schema import WebhookCreate
from api.services.kafka_producer import publish_job
from api.db.database import engine, Base
from api.db.models import WebhookEvent
from api.websocket.manager import manager
from api.services.redis_pubsub import redis_subscriber
from sqlalchemy.ext.asyncio import AsyncSession
from api.db.database import get_db
from fastapi.responses import Response

from prometheus_client import (
    generate_latest,
    CONTENT_TYPE_LATEST
)


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

@app.get("/")
async def health():
    return {
        "status" : "running"
    }


@app.on_event("startup")
async def startup():

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    asyncio.create_task(redis_subscriber())
    
    logger.info("Database tables created")
    logger.info("Redis pub/sub subscriber started")


@app.post("/webhooks")
async def create_webhook_event(webhook: WebhookCreate, db: AsyncSession = Depends(get_db)):

    webhook_id = uuid.uuid4()

    event = {
        "webhook_id": str(webhook_id),
        "webhook_url": webhook.webhook_url,
        "event_type": webhook.event_type,
        "payload": webhook.payload,
        "status": "QUEUED"
    }

    try:
        db_webhook = WebhookEvent(
            id=webhook_id,
            webhook_url=webhook.webhook_url,
            event_type=webhook.event_type,
            payload=json.dumps(webhook.payload),
            status="QUEUED"
        )

        db.add(db_webhook)

        await db.commit()

        await db.refresh(db_webhook)

        logger.info(
            f"Inserted webhooks into DB: {webhook_id}"
        )
        publish_job(
            topic="webhooks.created",
            data=event
        )

        logger.info(f"Webhook queued successfully: {webhook_id}")

        return {
            "message": "Webhook queued",
            "webhook_id": str(webhook_id)
        }

    except Exception as e:
        await db.rollback()

        logger.error(f"Failed to queue webhook: {str(e)}")

        raise HTTPException(
            status_code=500,
            detail="Failed to queue webhook"
        )


@app.websocket("/ws/webhooks")
async def websocket_webhooks(websocket: WebSocket):

    await manager.connect(websocket)

    try: 
        while True:
            await websocket.receive_text()
            
    except WebSocketDisconnect as e:
        logger.info("Client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
    finally:
        manager.disconnect(websocket)

@app.get("/metrics")
async def metrics():
    return Response(
        content=generate_latest(),
        media_type=CONTENT_TYPE_LATEST
    )