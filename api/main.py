import uuid
import logging

from fastapi import FastAPI, HTTPException

from shared.schemas.job_schema import JobCreate
from api.services.kafka_producer import publish_job

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

@app.get("/")
async def health():
    return {
        "status" : "running"
    }

@app.post("/jobs")
async def create_job(job: JobCreate):

    job_id = str(uuid.uuid4())

    event = {
        "job_id": job_id,
        "type": job.type,
        "payload": job.payload,
        "status": "QUEUED"
    }

    try:
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
        logger.error(f"Failed to queue job: {str(e)}")

        raise HTTPException(
            status_code=500,
            detail="Failed to publish job event"
        )

    

