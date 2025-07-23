import asyncio
from typing import AsyncGenerator, Generator

import pytest
import pytest_asyncio
import redis.asyncio as redis
from fastapi.testclient import TestClient
from httpx import ASGITransport, AsyncClient
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import sessionmaker, Session

from src.database import Base, get_async_db
from src.main import app
from src.redis import get_redis_client

# --- Database Fixtures ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
ASYNC_SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///./test.db"

# Sync engine for setup/teardown
sync_engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

# Async engine for tests
async_engine = create_async_engine(ASYNC_SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
AsyncTestingSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    """Create the database and tables before tests run."""
    Base.metadata.create_all(bind=sync_engine)
    yield
    Base.metadata.drop_all(bind=sync_engine)

@pytest_asyncio.fixture()
async def async_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Provides a transactional async database session for a test."""
    async with AsyncTestingSessionLocal() as session:
        yield session

# --- Application and Client Fixtures ---
@pytest_asyncio.fixture()
async def async_client(async_db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Provides an async test client for the FastAPI application."""

    async def override_get_async_db() -> AsyncGenerator[AsyncSession, None]:
        yield async_db_session

    app.dependency_overrides[get_async_db] = override_get_async_db
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
    
    del app.dependency_overrides[get_async_db]

# --- Redis Fixture ---
# For now, we assume the dev redis is okay for testing.
# In a real-world scenario, you might want a separate test redis instance.
@pytest_asyncio.fixture()
async def redis_client() -> AsyncGenerator[redis.Redis, None]:
    """Provides a redis client for a test."""
    async for client in get_redis_client():
        await client.flushdb() # Clean the db before the test
        yield client
        await client.flushdb() # Clean the db after the test 