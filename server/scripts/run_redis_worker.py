import asyncio
import os
import logging

from api.services.audit_worker_redis import _redis_worker

logger = logging.getLogger("uvicorn.error")


async def main():
    redis_url = os.environ.get("AUDIT_REDIS_URL")
    if not redis_url:
        logger.error("AUDIT_REDIS_URL not set")
        return
    await _redis_worker(redis_url)


if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
