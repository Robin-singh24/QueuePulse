from pydantic import BaseModel
from typing import Dict, Any

class WebhookCreate(BaseModel):

    webhook_url: str

    event_type: str

    payload: Dict[str, Any]