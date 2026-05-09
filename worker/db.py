from sqlalchemy.ext.asyncio import (
    create_async_engine,
    async_sessionmaker
)

DATABASE_URL = (
    "postgresql+asyncpg://admin:admin@postgres:5432/pulsequeue"
)


engine = create_async_engine(
    DATABASE_URL,
    echo=False
)
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False
)