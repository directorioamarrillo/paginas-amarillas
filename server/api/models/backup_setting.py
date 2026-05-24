from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text
from api.db.conexion import Base

class BackupSetting(Base):
    __tablename__ = 'backup_settings'

    id_setting = Column(Integer, primary_key=True, index=True)
    frequency = Column(String(20), default='daily', nullable=False)  # 'daily', 'weekly', 'monthly'
    last_run_at = Column(DateTime, nullable=True)
    last_status = Column(String(20), nullable=True)  # 'success', 'error', 'running'
    last_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
