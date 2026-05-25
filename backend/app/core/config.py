import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Configuración de base de datos
    SQLALCHEMY_DATABASE_URL: str = os.getenv("SQLALCHEMY_DATABASE_URL", "sqlite:///./test.db")
    
    DB_HOST: str = os.getenv("DB_HOST", "127.0.0.1")
    DB_PORT: str = os.getenv("DB_PORT", "3306")
    DB_DATABASE: str = os.getenv("DB_DATABASE", "")
    DB_USERNAME: str = os.getenv("DB_USERNAME", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")

    # Rutas para binarios MySQL
    MYSQLDUMP_PATH: str = os.getenv("MYSQLDUMP_PATH", "mysqldump")
    MYSQL_CLIENT_PATH: str = os.getenv("MYSQL_CLIENT_PATH", "mysql")

    # Configuración general de backups
    BACKUP_NAME: str = os.getenv("BACKUP_NAME", "backup")
    BACKUP_FREQUENCY: str = os.getenv("BACKUP_FREQUENCY", "daily")
    BACKUP_MEMORY_LIMIT: str = os.getenv("BACKUP_MEMORY_LIMIT", "512M")
    BACKUP_PROCESS_TIMEOUT: int = int(os.getenv("BACKUP_PROCESS_TIMEOUT", "300"))
    BACKUP_ARCHIVE_PASSWORD: str = os.getenv("BACKUP_ARCHIVE_PASSWORD", "")
    BACKUP_TEMP_DIR: str = os.getenv("BACKUP_TEMP_DIR", "temp_backups")

    # Integración con Google Drive
    GOOGLE_DRIVE_CLIENT_ID: str = os.getenv("GOOGLE_DRIVE_CLIENT_ID", "")
    GOOGLE_DRIVE_CLIENT_SECRET: str = os.getenv("GOOGLE_DRIVE_CLIENT_SECRET", "")
    GOOGLE_DRIVE_REFRESH_TOKEN: str = os.getenv("GOOGLE_DRIVE_REFRESH_TOKEN", "")
    GOOGLE_DRIVE_FOLDER_ID: str = os.getenv("GOOGLE_DRIVE_FOLDER_ID", "")

settings = Settings()
