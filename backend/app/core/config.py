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

    # Rutas para binarios MySQL y PostgreSQL (Soporte multiplataforma)
    MYSQLDUMP_PATH: str = os.getenv("MYSQLDUMP_PATH", "mysqldump")
    MYSQL_CLIENT_PATH: str = os.getenv("MYSQL_CLIENT_PATH", "mysql")
    PG_DUMP_PATH: str = os.getenv("PG_DUMP_PATH", "pg_dump")
    PSQL_PATH: str = os.getenv("PSQL_PATH", "psql")

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

    # Configuración SMTP (Email 2FA)
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", 587))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")

settings = Settings()
