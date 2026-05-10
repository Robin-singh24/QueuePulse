import uuid

from sqlalchemy import (
    Column,
    String,
    Integer,
    Text,
    DateTime
)

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from api.db.database import Base


class WebhookEvent(Base):

    __tablename__ = "webhook_events"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    event_type = Column(String, nullable=False)

    webhook_url = Column(String, nullable=False)

    status = Column(String, nullable=False, default="QUEUED")

    payload = Column(Text, nullable=False)

    retry_count = Column(Integer, default=0)

    error_message = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        onupdate=func.now(),
        server_default=func.now()
    )

    processed_at = Column(
        DateTime(timezone=True),
        nullable=True
    )
