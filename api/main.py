import uuid
import logging
import asyncio
import json

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Depends

from shared.schemas.job_schema import JobCreate
from api.services.kafka_producer import publish_job
from api.db.database import engine, Base
from api.db.models import Job
from api.websocket.manager import manager
from api.services.redis_pubsub import redis_subscriber
from sqlalchemy.ext.asyncio import AsyncSession
from api.db.database import get_db


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


@app.post("/jobs")
async def create_job(job: JobCreate, db: AsyncSession = Depends(get_db)):

    job_id = str(uuid.uuid4())

    event = {
        "job_id": str(job_id),
        "type": job.type,
        "payload": job.payload,
        "status": "QUEUED"
    }

    try:
        db_job = Job(
            id=job_id,
            type=job.type,
            payload=json.dumps(job.payload),
            status="QUEUED"
        )

        db.add(db_job)

        await db.commit()

        await db.refresh(db_job)

        logger.info(
            f"Inserted job into DB: {job_id}"
        )
        publish_job(
            topic="jobs.created",
            data=event
        )

        logger.info(f"Job queued successfully: {job_id}")

        return {
            "message": "Job Queued",
            "job_id": job_id
        }
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to queue job: {str(e)}")

        raise HTTPException(
            status_code=500,
            detail="Failed to publish job event"
        )


@app.websocket("/ws/jobs")
async def websocket_jobs(websocket: WebSocket):

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
