import os
import asyncio
import logging
from types import SimpleNamespace

from app.db.conexion import async_session
from app.api.auditoria import audit_report_summary_pdf, _send_email_bytes

logger = logging.getLogger('uvicorn.error')


def attach_report_scheduler(app):
    """Attach a background async task that runs daily at REPORT_SCHEDULE_HOUR and sends the audit summary.
    Controlled by env var ENABLE_REPORT_SCHEDULER=1. Recipients read from REPORT_RECIPIENTS.
    """
    if os.getenv('ENABLE_REPORT_SCHEDULER', '0') != '1':
        logger.info('Report scheduler disabled (ENABLE_REPORT_SCHEDULER!=1)')
        return

    hour_spec = os.getenv('REPORT_SCHEDULE_HOUR', '09:00')
    try:
        hh, mm = [int(x) for x in hour_spec.split(':')]
    except Exception:
        hh, mm = 9, 0

    async def _daily_loop():
        logger.info('Report scheduler started, will run daily at %02d:%02d', hh, mm)
        while True:
            now = asyncio.get_event_loop().time()
            # compute seconds until next target in local time
            import datetime
            today = datetime.datetime.now()
            target = today.replace(hour=hh, minute=mm, second=0, microsecond=0)
            if target <= today:
                target = target + datetime.timedelta(days=1)
            wait_seconds = (target - today).total_seconds()
            logger.info('Next report send in %.0f seconds', wait_seconds)
            await asyncio.sleep(wait_seconds)

            # build pdf and send
            try:
                async with async_session() as db:
                    # create a dummy admin user
                    sys_user = SimpleNamespace()
                    sys_user.rol_obj = SimpleNamespace(nombre='admin')
                    resp = await audit_report_summary_pdf(current_user=sys_user, db=db)
                    pdf_bytes = getattr(resp, 'body', None) or getattr(resp, 'content', None)
                    if pdf_bytes:
                        env_recip = os.getenv('REPORT_RECIPIENTS', '')
                        dests = [r.strip() for r in env_recip.split(',') if r.strip()]
                        if dests:
                            # send in thread (blocking SMTP) without awaiting
                            loop = asyncio.get_event_loop()
                            loop.run_in_executor(None, _send_email_bytes, pdf_bytes, dests, None, None)
                        else:
                            logger.warning('No REPORT_RECIPIENTS configured; skipping email send')
                    else:
                        logger.error('Scheduler: no PDF bytes generated')
            except Exception:
                logger.exception('Error during scheduled report send')

    # Schedule the background task on startup
    try:
        app.add_event_handler('startup', lambda: asyncio.create_task(_daily_loop()))
    except Exception:
        logger.exception('Could not attach report scheduler')
