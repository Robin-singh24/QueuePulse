from pydantic import BaseModel
from typing import Optional

class JobCreate(BaseModel):
    
    type: str

    payload: Optional[dict] = None

