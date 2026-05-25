from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class BackupSettingResponse(BaseModel):
    id_setting: int
    frequency: str
    last_run_at: Optional[datetime] = None
    last_status: Optional[str] = None
    last_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class BackupScheduleUpdate(BaseModel):
    frequency: str  # 'daily', 'weekly', 'monthly'

class BackupItem(BaseModel):
    id: str  # Google Drive file ID o nombre de archivo local
    name: str
    size: str  # Ejemplo: "1.2 MB"
    size_bytes: int
    created_time: datetime
    location: str  # "Google Drive" o "Local"
    status: str  # "success" o "error"

class BackupStatusResponse(BaseModel):
    is_running: bool
    last_run_at: Optional[datetime] = None
    last_status: Optional[str] = None
    last_message: Optional[str] = None

class BackupSummaryResponse(BaseModel):
    total_backups: int
    last_backup_date: Optional[datetime] = None
    last_backup_status: Optional[str] = None
    storage_type: str  # "Google Drive" o "Local"
    google_drive_configured: bool
    backups: List[BackupItem]
    config: BackupSettingResponse
