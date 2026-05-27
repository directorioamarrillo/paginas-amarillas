import os
import sys
import argparse
import asyncio
import logging
from datetime import datetime, timedelta
from sqlalchemy import select

# Asegurar que el directorio server está en el PYTHONPATH
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.db.conexion import async_session
from app.models.backup_setting import BackupSetting
from app.services.backup_service import BackupService

# Configurar logging profesional
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("BackupScheduler")

def send_discord_alert(message: str):
    webhook_url = os.getenv("DISCORD_WEBHOOK_URL")
    if not webhook_url:
        return
    import httpx
    try:
        httpx.post(webhook_url, json={"content": f"🚨 **ALERTA CRÍTICA DE BACKUP** 🚨\n```\n{message}\n```"})
    except Exception as e:
        logger.error(f"Error enviando alerta de Discord: {e}")

def is_backup_due(setting: BackupSetting) -> bool:
    if not setting.last_run_at:
        return True

    now = datetime.now()
    delta = now - setting.last_run_at

    if setting.frequency == "daily":
        return delta >= timedelta(days=1)
    elif setting.frequency == "weekly":
        return delta >= timedelta(weeks=1)
    elif setting.frequency == "monthly":
        return delta >= timedelta(days=30)
    return False

async def check_and_run_backup(force: bool = False):
    async with async_session() as db:
        try:
            result = await db.execute(select(BackupSetting))
            setting = result.scalar_one_or_none()
            if not setting:
                logger.info("No se encontró configuración de backups. Creando por defecto...")
                setting = BackupSetting(frequency="daily")
                db.add(setting)
                await db.commit()
                await db.refresh(setting)

            if await BackupService.is_running(db):
                logger.info("El proceso de backup ya se está ejecutando en la base de datos. Omitiendo...")
                return

            if force or is_backup_due(setting):
                logger.info(f"Iniciando backup automático programado (fuerza={force}, frecuencia={setting.frequency})...")
                result_backup = await BackupService.generate_backup(db)
                logger.info(f"Backup automático completado con éxito: {result_backup}")
            else:
                logger.debug(f"No es necesario realizar backup. Frecuencia: {setting.frequency}. Última ejecución: {setting.last_run_at}")
        except Exception as e:
            error_msg = f"Error durante la ejecución del backup programado: {str(e)}"
            logger.error(error_msg, exc_info=True)
            send_discord_alert(error_msg)

async def run_daemon(interval_seconds: int = 3600):
    logger.info(f"Iniciando demonio del planificador de backups (intervalo: {interval_seconds}s)...")
    while True:
        await check_and_run_backup()
        await asyncio.sleep(interval_seconds)

def main():
    parser = argparse.ArgumentParser(description="Planificador de Backups para Directorio 2.0")
    parser.add_argument("--daemon", action="store_true", help="Ejecutar como servicio persistente (demonio)")
    parser.add_argument("--interval", type=int, default=3600, help="Intervalo de verificación en segundos para el modo demonio (por defecto: 3600)")
    parser.add_argument("--run-once", action="store_true", help="Ejecutar una sola verificación y salir (para cron/Task Scheduler)")
    parser.add_argument("--force", action="store_true", help="Fuerza la ejecución inmediata de la copia de seguridad ignorando la frecuencia")
    
    args = parser.parse_args()

    # Si no se especifica ningún argumento, se ejecuta por defecto --run-once
    if not args.daemon and not args.run_once:
        args.run_once = True

    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    if args.run_once:
        loop.run_until_complete(check_and_run_backup(force=args.force))
    elif args.daemon:
        try:
            loop.run_until_complete(run_daemon(args.interval))
        except KeyboardInterrupt:
            logger.info("Demonio de backups detenido por el usuario.")

if __name__ == "__main__":
    main()
