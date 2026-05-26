from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy import MetaData
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os
import ssl
from dotenv import load_dotenv

from fastapi import FastAPI
from contextlib import asynccontextmanager

# Load environment variables
load_dotenv()

# Variables de base de datos con prefijo DB_ para no conflictuar con HOST/PORT del servidor
DB_USER     = os.environ.get("DB_USER") or os.environ.get("USER")
DB_PASSWORD = os.environ.get("DB_PASSWORD") or os.environ.get("PASSWORD")
DB_HOST     = os.environ.get("DB_HOST") or os.environ.get("HOST")
DB_NAME     = os.environ.get("DB_NAME") or os.environ.get("DATABASE")
DB_PORT     = os.environ.get("DB_PORT") or os.environ.get("DB_PORT_NUM", "5432")
DB_SSL      = os.environ.get("DB_SSL", "false").lower() in ("true", "1", "yes")

if not DB_USER:
    raise ValueError("Falta variable de entorno 'DB_USER'")
if not DB_PASSWORD:
    raise ValueError("Falta variable de entorno 'DB_PASSWORD'")
if not DB_HOST:
    raise ValueError("Falta variable de entorno 'DB_HOST'")
if not DB_NAME:
    raise ValueError("Falta variable de entorno 'DB_NAME'")

DATABASE_URL = f"postgresql+asyncpg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Configurar SSL para Aiven u otros proveedores cloud
connect_args = {}
if DB_SSL:
    ssl_ctx = ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE  # Aiven usa certs auto-firmados en algunos planes
    connect_args["ssl"] = ssl_ctx

# Database connection
DB_ECHO = os.environ.get("DB_ECHO", "false").lower() == "true"
engine = create_async_engine(
    DATABASE_URL,
    echo=DB_ECHO,
    connect_args=connect_args,
)

# Sesión para interactuar con la DB
async_session = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Clase base para los modelos
Base = declarative_base(metadata=MetaData())


@asynccontextmanager
async def get_session_async() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session


async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield