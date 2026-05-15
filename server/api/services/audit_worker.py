import asyncio
import logging
from typing import Any

from api.db.conexion import async_session
from api.services.audit_service import registrar_auditoria_batch

logger = logging.getLogger("uvicorn.error")


async def _worker(queue: "asyncio.Queue[dict[str, Any]]", batch_size: int = 50, batch_timeout: float = 1.0):
    logger.info("Audit worker started (batch_size=%s, timeout=%s)", batch_size, batch_timeout)
    while True:
        try:
            item = await queue.get()
            if item is None:
                # Drain remaining items and exit
                items = []
                while not queue.empty():
                    nxt = await queue.get()
                    if nxt is None:
                        break
                    items.append(nxt)
                    queue.task_done()
                if items:
                    try:
                        async with async_session() as db_sess:
                            await registrar_auditoria_batch(db_sess, items)
                    except Exception:
                        logger.exception("Error writing final batch audit logs")
                break

            # Gather a batch starting with the first item
            items = [item]

            # Try to fill up to batch_size quickly
            try:
                for _ in range(batch_size - 1):
                    nxt = queue.get_nowait()
                    if nxt is None:
                        # re-insert termination marker to be handled next loop
                        await queue.put(None)
                        break
                    items.append(nxt)
            except asyncio.QueueEmpty:
                # Wait up to batch_timeout for more items
                try:
                    while len(items) < batch_size:
                        nxt = await asyncio.wait_for(queue.get(), timeout=batch_timeout)
                        if nxt is None:
                            await queue.put(None)
                            break
                        items.append(nxt)
                except asyncio.TimeoutError:
                    pass

            # Persist batch
            try:
                async with async_session() as db_sess:
                    await registrar_auditoria_batch(db_sess, items)
            except Exception:
                logger.exception("Error writing audit batch")
            finally:
                for _ in items:
                    try:
                        queue.task_done()
                    except Exception:
                        pass

        except asyncio.CancelledError:
            break
        except Exception:
            logger.exception("Unexpected error in audit worker loop")


def attach_audit_worker(app):
    """Attach an asyncio queue and background task to the FastAPI app."""
    q: asyncio.Queue = asyncio.Queue()
    app.state.audit_queue = q

    async def _startup():
        app.state._audit_task = asyncio.create_task(_worker(q))

    async def _shutdown():
        try:
            # Signal worker to stop
            await q.put(None)
            await app.state._audit_task
        except Exception:
            logger.exception("Error shutting down audit worker")

    app.add_event_handler("startup", _startup)
    app.add_event_handler("shutdown", _shutdown)


def attach_queued_worker(app):
    """Compatibility helper used by main.py: chooses local queue worker by default."""
    attach_audit_worker(app)
