import io
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db.conexion import get_db
from app.api.auth import require_admin
from app.models.backup_setting import BackupSetting
from app.schemas.backup import (
    BackupSettingResponse,
    BackupScheduleUpdate,
    BackupSummaryResponse,
    BackupStatusResponse
)
from app.services.backup_service import BackupService
from app.services.google_drive_service import GoogleDriveService

router = APIRouter(prefix="/backups", tags=["Backups"])

@router.get("", response_model=BackupSummaryResponse)
async def get_backups_summary(db: Session = Depends(get_db), _=Depends(require_admin)):
    """Obtiene el listado de backups, configuraciones y el resumen del almacenamiento."""
    # Buscar o crear configuración por defecto
    setting = (await db.execute(select(BackupSetting))).scalar_one_or_none()
    if not setting:
        setting = BackupSetting(frequency="daily")
        db.add(setting)
        await db.commit()
        await db.refresh(setting)

    try:
        backups = await BackupService.list_backups()
    except Exception as e:
        # Si falla el listado, retornar lista vacía pero no romper el endpoint de resumen
        print(f"Error listando backups en endpoint: {e}")
        backups = []

    # Determinar el último backup exitoso
    last_backup_date = None
    success_backups = [b for b in backups if b["status"] == "success"]
    if success_backups:
        # El primero es el más reciente debido al ordenamiento desc
        last_backup_date = success_backups[0]["created_time"]

    drive_configured = GoogleDriveService.is_configured()

    return {
        "total_backups": len(backups),
        "last_backup_date": last_backup_date,
        "last_backup_status": setting.last_status,
        "storage_type": "Google Drive" if drive_configured else "Local Fallback",
        "google_drive_configured": drive_configured,
        "backups": backups,
        "config": setting
    }

@router.get("/status", response_model=BackupStatusResponse)
async def get_backup_status(db: Session = Depends(get_db), _=Depends(require_admin)):
    """Obtiene el estado del último proceso de backup."""
    setting = (await db.execute(select(BackupSetting))).scalar_one_or_none()
    if not setting:
        setting = BackupSetting(frequency="daily")
        db.add(setting)
        await db.commit()
        await db.refresh(setting)

    return {
        "is_running": await BackupService.is_running(db),
        "last_run_at": setting.last_run_at,
        "last_status": setting.last_status,
        "last_message": setting.last_message
    }

@router.post("/generate", status_code=status.HTTP_202_ACCEPTED)
async def generate_manual_backup(db: Session = Depends(get_db), _=Depends(require_admin)):
    """Genera una copia de seguridad manual de la base de datos."""
    if await BackupService.is_running(db):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una tarea de backup en ejecución."
        )
    
    try:
        # Lanzamos de manera síncrona/espera para retornar el éxito o error directo
        result = await BackupService.generate_backup(db)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Fallo al generar el backup: {str(e)}"
        )

@router.get("/download")
async def download_backup(path: str = Query(..., description="ID del archivo de Google Drive o nombre del backup local"), _=Depends(require_admin)):
    """Descarga un backup según su path codificado (file_id)."""
    try:
        content, filename = await BackupService.download_backup(path)
        return StreamingResponse(
            io.BytesIO(content),
            media_type="application/zip",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se pudo descargar el backup: {str(e)}"
        )

@router.delete("")
async def delete_backup(path: str = Query(..., description="ID del archivo de Google Drive o nombre del backup local"), _=Depends(require_admin)):
    """Elimina una copia de seguridad permanentemente."""
    try:
        await BackupService.delete_backup(path)
        return {"success": True, "message": "Backup eliminado correctamente."}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Fallo al eliminar el backup: {str(e)}"
        )

@router.put("/schedule", response_model=BackupSettingResponse)
async def update_backup_schedule(payload: BackupScheduleUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    """Actualiza la frecuencia programada para backups automáticos."""
    if payload.frequency not in ("daily", "weekly", "monthly"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Frecuencia inválida. Valores permitidos: 'daily', 'weekly', 'monthly'."
        )

    setting = (await db.execute(select(BackupSetting))).scalar_one_or_none()
    if not setting:
        setting = BackupSetting(frequency=payload.frequency)
        db.add(setting)
    else:
        setting.frequency = payload.frequency
        setting.updated_at = datetime.utcnow()
        
    await db.commit()
    await db.refresh(setting)
    return setting

@router.post("/restore")
async def restore_backup(payload: dict, db: Session = Depends(get_db), _=Depends(require_admin)):
    """Restaura la base de datos a partir del backup seleccionado."""
    file_id = payload.get("path")
    if not file_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Falta el parámetro 'path' con el identificador del backup."
        )

    if await BackupService.is_running(db):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se puede iniciar la restauración mientras otra tarea esté activa."
        )

    try:
        result = await BackupService.restore_backup(db, file_id)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/reset-status")
async def reset_backup_status(db: Session = Depends(get_db), _=Depends(require_admin)):
    """Reinicia un estado bloqueado 'En proceso' en caso de caídas del servidor."""
    setting = (await db.execute(select(BackupSetting))).scalar_one_or_none()
    if setting:
        setting.last_status = "error"
        setting.last_message = "Proceso desbloqueado manualmente por el administrador."
        await db.commit()
        await db.refresh(setting)
    
    return {"success": True, "message": "Estado de backup desbloqueado correctamente."}
