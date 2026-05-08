from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base


DATABSE_URL = "postgresql+asyncpg://admin:admin@postgres:5432/pulsequeue"

engine = create_async_engine(
    DATABSE_URL,
    echo=True
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False
)

Base = declarative_base()