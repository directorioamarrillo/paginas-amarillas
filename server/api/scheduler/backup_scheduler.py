import os
import sys
import time
import argparse
import asyncio
from datetime import datetime, timedelta

# Asegurar que el directorio server está en el PYTHONPATH
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from api.db.conexion import SessionLocal
from api.models.backup_setting import BackupSetting
from api.services.backup_service import BackupService

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
    db = SessionLocal()
    try:
        setting = db.query(BackupSetting).first()
        if not setting:
            print("No se encontró configuración de backups. Creando por defecto...")
            setting = BackupSetting(frequency="daily")
            db.add(setting)
            db.commit()
            db.refresh(setting)

        if BackupService.is_running():
            print("El proceso de backup ya se está ejecutando. Omitiendo...")
            return

        if force or is_backup_due(setting):
            print(f"Iniciando backup automático programado (fuerza={force}, frecuencia={setting.frequency})...")
            result = await BackupService.generate_backup(db)
            print(f"Backup automático completado con éxito: {result}")
        else:
            print(f"No es necesario realizar backup. Frecuencia: {setting.frequency}. Última ejecución: {setting.last_run_at}")
    except Exception as e:
        print(f"Error durante la ejecución del backup programado: {e}")
    finally:
        db.close()

async def run_daemon(interval_seconds: int = 3600):
    print(f"Iniciando demonio del planificador de backups (intervalo: {interval_seconds}s)...")
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
        # Usar get_event_loop() o crear un nuevo loop si no existe
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
            print("Demonio de backups detenido por el usuario.")

if __name__ == "__main__":
    main()
