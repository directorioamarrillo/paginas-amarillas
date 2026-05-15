import asyncio
import logging
import os
import json
from typing import Any

logger = logging.getLogger("uvicorn.error")


async def _redis_worker(redis_url: str, queue_key: str = "audit_queue"):
    try:
        import aioredis
    except Exception:
        logger.error("aioredis is required for Redis audit worker")
        return

    redis = aioredis.from_url(redis_url)
    logger.info("Redis audit worker started, listening on %s", queue_key)

    while True:
        try:
            _, raw = await redis.blpop(queue_key)
            if not raw:
                continue
            try:
                payload = json.loads(raw)
            except Exception:
                logger.exception("Invalid payload in redis audit queue")
                continue

            # Write via local DB session using registrar_auditoria
            try:
                from api.db.conexion import async_session
                from api.services.audit_service import registrar_auditoria
                async with async_session() as db_sess:
                    await registrar_auditoria(db_sess, **payload)
            except Exception:
                logger.exception("Error persisting audit from redis payload")

        except asyncio.CancelledError:
            break
        except Exception:
            logger.exception("Error in redis audit worker loop")


def attach_redis_worker(app):
    redis_url = os.environ.get("AUDIT_REDIS_URL")
    if not redis_url:
        logger.warning("AUDIT_REDIS_URL not set; skipping redis audit worker")
        return

    async def _startup():
        app.state._redis_audit_task = asyncio.create_task(_redis_worker(redis_url))

    async def _shutdown():
        try:
            app.state._redis_audit_task.cancel()
            await app.state._redis_audit_task
        except Exception:
            logger.exception("Error shutting down redis audit worker")

    app.add_event_handler("startup", _startup)
    app.add_event_handler("shutdown", _shutdown)
