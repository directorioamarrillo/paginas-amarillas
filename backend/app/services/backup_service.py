import os
import shutil
import zipfile
import subprocess
import sqlite3
import httpx
from datetime import datetime
from typing import List, Tuple, Dict, Any

from app.core.config import settings
from app.services.google_drive_service import GoogleDriveService
from app.models.backup_setting import BackupSetting
from sqlalchemy.orm import Session
from sqlalchemy import select
class BackupService:
    @staticmethod
    async def is_running(db: Session) -> bool:
        # Check DB status instead of memory
        result = await db.execute(select(BackupSetting))
        setting = result.scalar_one_or_none()
        if setting and setting.last_status == "running":
            # Si se quedó pegado hace más de 30 minutos por un crash, ignorar el lock
            if setting.last_run_at and (datetime.now() - setting.last_run_at).total_seconds() > 1800:
                setting.last_status = "error"
                setting.last_message = "Proceso anterior cancelado por timeout del sistema."
                await db.commit()
                return False
            return True
        return False

    @staticmethod
    def get_db_type() -> str:
        """Determina el motor de la base de datos según SQLALCHEMY_DATABASE_URL."""
        db_url = settings.SQLALCHEMY_DATABASE_URL.lower()
        if "sqlite" in db_url:
            return "sqlite"
        elif "mysql" in db_url or "mariadb" in db_url:
            return "mysql"
        elif "postgresql" in db_url:
            return "postgresql"
        else:
            # Por defecto postgresql si no se detecta el tipo
            return "postgresql"

    @staticmethod
    def _get_db_connection_info() -> Dict[str, str]:
        """Extrae la información de conexión de la URL de la base de datos o de los settings."""
        import urllib.parse
        db_url = settings.SQLALCHEMY_DATABASE_URL
        
        # Valores por defecto de los settings
        info = {
            "host": settings.DB_HOST or "127.0.0.1",
            "port": settings.DB_PORT or "5432",
            "database": settings.DB_DATABASE or "",
            "username": settings.DB_USERNAME or "postgres",
            "password": settings.DB_PASSWORD or ""
        }
        
        # Intentar parsear de la URL si no es sqlite
        if not db_url.startswith("sqlite"):
            try:
                # Limpiar prefijos de async
                url_to_parse = db_url
                if "postgresql+asyncpg://" in url_to_parse:
                    url_to_parse = url_to_parse.replace("postgresql+asyncpg://", "postgresql://", 1)
                elif "mysql+aiomysql://" in url_to_parse:
                    url_to_parse = url_to_parse.replace("mysql+aiomysql://", "mysql://", 1)
                
                parsed = urllib.parse.urlparse(url_to_parse)
                if parsed.hostname:
                    info["host"] = parsed.hostname
                if parsed.port:
                    info["port"] = str(parsed.port)
                if parsed.username:
                    info["username"] = parsed.username
                if parsed.password:
                    info["password"] = urllib.parse.unquote(parsed.password)
                if parsed.path:
                    info["database"] = parsed.path.lstrip('/')
            except Exception as e:
                print(f"Error parsing database URL: {e}")
                
        return info

    @staticmethod
    def get_local_storage_dir() -> str:
        """Obtiene la ruta del directorio local de fallback para los backups."""
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        local_dir = os.path.join(base_dir, "backups_local")
        os.makedirs(local_dir, exist_ok=True)
        return local_dir

    @staticmethod
    def get_temp_dir() -> str:
        """Obtiene y crea la carpeta temporal."""
        temp_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", settings.BACKUP_TEMP_DIR))
        os.makedirs(temp_dir, exist_ok=True)
        return temp_dir

    @staticmethod
    def clean_temp_dir():
        """Limpia los archivos dentro de la carpeta temporal."""
        temp_dir = BackupService.get_temp_dir()
        if os.path.exists(temp_dir):
            for filename in os.listdir(temp_dir):
                file_path = os.path.join(temp_dir, filename)
                try:
                    if os.path.isfile(file_path) or os.path.islink(file_path):
                        os.unlink(file_path)
                    elif os.path.isdir(file_path):
                        shutil.rmtree(file_path)
                except Exception as e:
                    print(f"Error limpiando temporal {file_path}: {e}")

    @staticmethod
    def format_size(bytes_size: int) -> str:
        """Formatea el tamaño en bytes a una representación legible (KB, MB, GB)."""
        for unit in ['Bytes', 'KB', 'MB', 'GB', 'TB']:
            if bytes_size < 1024.0:
                return f"{bytes_size:.2f} {unit}"
            bytes_size /= 1024.0
        return f"{bytes_size:.2f} PB"

    @staticmethod
    def _get_pyzipper():
        """Intenta importar pyzipper si está disponible para soporte de contraseñas AES."""
        try:
            import pyzipper
            return pyzipper
        except ImportError:
            return None

    @staticmethod
    def create_zip(source_file: str, zip_path: str, filename_in_zip: str):
        """Crea un archivo ZIP comprimido, encriptado de forma segura con pyzipper."""
        password = settings.BACKUP_ARCHIVE_PASSWORD
        pyzipper_lib = BackupService._get_pyzipper()

        if not pyzipper_lib:
            raise Exception("Seguridad crítica: la librería 'pyzipper' no está instalada. Ejecuta 'pip install pyzipper'.")
        if not password:
            raise Exception("Seguridad crítica: la variable 'BACKUP_ARCHIVE_PASSWORD' no está definida en el .env.")

        # Comprimir con encriptación AES 256
        with pyzipper_lib.AESZipFile(zip_path, 'w', compression=pyzipper_lib.ZIP_DEFLATED, encryption=pyzipper_lib.WZ_AES) as zf:
            zf.setpassword(password.encode('utf-8'))
            zf.write(source_file, arcname=filename_in_zip)

    @staticmethod
    def extract_zip(zip_path: str, extract_to: str) -> str:
        """Extrae el contenido de un archivo ZIP encriptado. Retorna la ruta del archivo extraído."""
        password = settings.BACKUP_ARCHIVE_PASSWORD
        pyzipper_lib = BackupService._get_pyzipper()

        if not pyzipper_lib or not password:
            raise Exception("Seguridad crítica: Se requiere 'pyzipper' y una contraseña en '.env' para desencriptar el backup.")

        with pyzipper_lib.AESZipFile(zip_path) as zf:
            zf.setpassword(password.encode('utf-8'))
            zf.extractall(extract_to)
        
        # Encontrar el archivo extraído (debería ser el SQL o el DB)
        extracted_files = os.listdir(extract_to)
        if not extracted_files:
            raise Exception("El ZIP extraído está vacío.")
        return os.path.join(extract_to, extracted_files[0])

    @staticmethod
    def _execute_backup_raw() -> str:
        """Ejecuta el backup de la base de datos de forma directa a un archivo temporal local.
        Retorna la ruta del archivo temporal generado (SQL o DB)."""
        db_type = BackupService.get_db_type()
        temp_dir = BackupService.get_temp_dir()
        timestamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
        
        if db_type == "sqlite":
            # Obtener ruta de SQLite
            sqlite_path = settings.SQLALCHEMY_DATABASE_URL.replace("sqlite:///", "")
            # Si es ruta relativa simple, buscarla respecto a server/api o cwd
            db_file_path = os.path.abspath(sqlite_path)
            if not os.path.exists(db_file_path):
                raise Exception(f"Base de datos SQLite no encontrada en {db_file_path}")
            
            dest_file = os.path.join(temp_dir, f"backup_{timestamp}.db")
            
            # Copia segura usando la API backup() de sqlite3
            src_conn = sqlite3.connect(db_file_path)
            dest_conn = sqlite3.connect(dest_file)
            src_conn.backup(dest_conn)
            dest_conn.close()
            src_conn.close()
            return dest_file

        elif db_type == "mysql":
            db_info = BackupService._get_db_connection_info()
            dest_file = os.path.join(temp_dir, f"backup_{timestamp}.sql")
            
            cmd = [
                settings.MYSQLDUMP_PATH,
                "-h", db_info["host"],
                "-P", db_info["port"],
                "-u", db_info["username"],
                db_info["database"]
            ]
            
            env = os.environ.copy()
            if db_info["password"]:
                env["MYSQL_PWD"] = db_info["password"]

            try:
                with open(dest_file, "w", encoding="utf-8") as f:
                    result = subprocess.run(
                        cmd,
                        env=env,
                        stdout=f,
                        stderr=subprocess.PIPE,
                        text=True,
                        timeout=settings.BACKUP_PROCESS_TIMEOUT
                    )
                
                if result.returncode != 0:
                    err_msg = result.stderr or "Error desconocido en mysqldump"
                    if "not found" in err_msg.lower() or "no se reconoce" in err_msg.lower():
                        raise Exception("El comando 'mysqldump' no está instalado o no se encuentra en el PATH.")
                    elif "access denied" in err_msg.lower():
                        raise Exception("Credenciales de MySQL incorrectas. Acceso denegado.")
                    elif "unknown database" in err_msg.lower():
                        raise Exception(f"La base de datos MySQL '{db_info['database']}' no existe.")
                    raise Exception(f"mysqldump falló con código {result.returncode}: {err_msg}")
                    
                return dest_file
            except subprocess.TimeoutExpired:
                raise Exception("El proceso de mysqldump superó el tiempo límite configurado.")
            except FileNotFoundError:
                raise Exception("El binario de mysqldump no fue encontrado. Verifica MYSQLDUMP_PATH.")

        elif db_type == "postgresql":
            db_info = BackupService._get_db_connection_info()
            dest_file = os.path.join(temp_dir, f"backup_{timestamp}.sql")
            
            cmd = [
                settings.PG_DUMP_PATH,
                "-h", db_info["host"],
                "-p", db_info["port"],
                "-U", db_info["username"],
                "--clean",
                db_info["database"]
            ]
            
            env = os.environ.copy()
            if db_info["password"]:
                env["PGPASSWORD"] = db_info["password"]

            try:
                with open(dest_file, "w", encoding="utf-8") as f:
                    result = subprocess.run(
                        cmd,
                        env=env,
                        stdout=f,
                        stderr=subprocess.PIPE,
                        text=True,
                        timeout=settings.BACKUP_PROCESS_TIMEOUT
                    )
                
                if result.returncode != 0:
                    err_msg = result.stderr or "Error desconocido en pg_dump"
                    if "not found" in err_msg.lower() or "no se reconoce" in err_msg.lower():
                        raise Exception("El comando 'pg_dump' no está instalado o no se encuentra en el PATH.")
                    elif "password authentication failed" in err_msg.lower():
                        raise Exception("Credenciales de PostgreSQL incorrectas. Acceso denegado.")
                    elif "database" in err_msg.lower() and "does not exist" in err_msg.lower():
                        raise Exception(f"La base de datos PostgreSQL '{db_info['database']}' no existe.")
                    raise Exception(f"pg_dump falló con código {result.returncode}: {err_msg}")
                    
                return dest_file
            except subprocess.TimeoutExpired:
                raise Exception("El proceso de pg_dump superó el tiempo límite configurado.")
            except FileNotFoundError:
                raise Exception("El binario de pg_dump no fue encontrado o no está en el PATH.")

        else:
            raise Exception("Motor de base de datos no compatible para generación de backup.")

    @staticmethod
    def _execute_restore_raw(backup_file_path: str):
        """Restaura la base de datos desde un archivo descomprimido (SQL o DB) de forma directa."""
        db_type = BackupService.get_db_type()
        
        if db_type == "sqlite":
            sqlite_path = settings.SQLALCHEMY_DATABASE_URL.replace("sqlite:///", "")
            db_file_path = os.path.abspath(sqlite_path)
            
            # Restaurar en caliente usando sqlite3 backup()
            src_conn = sqlite3.connect(backup_file_path)
            dest_conn = sqlite3.connect(db_file_path)
            src_conn.backup(dest_conn)
            dest_conn.close()
            src_conn.close()

        elif db_type == "mysql":
            db_info = BackupService._get_db_connection_info()
            cmd = [
                settings.MYSQL_CLIENT_PATH,
                "-h", db_info["host"],
                "-P", db_info["port"],
                "-u", db_info["username"],
                db_info["database"]
            ]
            
            env = os.environ.copy()
            if db_info["password"]:
                env["MYSQL_PWD"] = db_info["password"]

            try:
                with open(backup_file_path, "r", encoding="utf-8") as f:
                    result = subprocess.run(
                        cmd,
                        env=env,
                        stdin=f,
                        stderr=subprocess.PIPE,
                        text=True,
                        timeout=settings.BACKUP_PROCESS_TIMEOUT
                    )
                
                if result.returncode != 0:
                    err_msg = result.stderr or "Error desconocido durante la importación MySQL"
                    if "access denied" in err_msg.lower():
                        raise Exception("Credenciales de MySQL incorrectas al intentar restaurar.")
                    raise Exception(f"La restauración de MySQL falló: {err_msg}")
            except subprocess.TimeoutExpired:
                raise Exception("El proceso de restauración superó el tiempo límite.")
            except FileNotFoundError:
                raise Exception("El cliente 'mysql' no fue encontrado. Verifica MYSQL_CLIENT_PATH.")

        elif db_type == "postgresql":
            db_info = BackupService._get_db_connection_info()
            cmd = [
                settings.PSQL_PATH,
                "-h", db_info["host"],
                "-p", db_info["port"],
                "-U", db_info["username"],
                "-d", db_info["database"]
            ]
            
            env = os.environ.copy()
            if db_info["password"]:
                env["PGPASSWORD"] = db_info["password"]

            try:
                with open(backup_file_path, "r", encoding="utf-8") as f:
                    result = subprocess.run(
                        cmd,
                        env=env,
                        stdin=f,
                        stderr=subprocess.PIPE,
                        text=True,
                        timeout=settings.BACKUP_PROCESS_TIMEOUT
                    )
                
                if result.returncode != 0:
                    err_msg = result.stderr or "Error desconocido durante la restauración de PostgreSQL"
                    if "password authentication failed" in err_msg.lower():
                        raise Exception("Credenciales de PostgreSQL incorrectas al intentar restaurar.")
                    raise Exception(f"La restauración de PostgreSQL falló: {err_msg}")
            except subprocess.TimeoutExpired:
                raise Exception("El proceso de restauración superó el tiempo límite.")
            except FileNotFoundError:
                raise Exception("El cliente 'psql' no fue encontrado o no está en el PATH.")
        else:
            raise Exception("Motor de base de datos no compatible para restauración.")

    @classmethod
    async def generate_backup(cls, db: Session) -> Dict[str, Any]:
        """Genera un backup, lo empaqueta, lo sube a la nube (o local) y actualiza el estado en BD."""
        if await cls.is_running(db):
            raise Exception("Ya hay una tarea de backup en proceso.")
        cls.clean_temp_dir()
        
        # Buscar o crear configuración de backup
        setting = (await db.execute(select(BackupSetting))).scalar_one_or_none()
        if not setting:
            setting = BackupSetting(frequency="daily")
            db.add(setting)
            await db.commit()
            await db.refresh(setting)

        setting.last_status = "running"
        setting.last_message = "Generando archivo de respaldo de base de datos..."
        await db.commit()

        try:
            # 1. Generar backup crudo
            raw_file = cls._get_file_from_backup_generation()
            
            # 2. Comprimir en ZIP
            temp_dir = cls.get_temp_dir()
            filename = f"{settings.BACKUP_NAME}_{datetime.now().strftime('%Y-%m-%d_%H%M%S')}.zip"
            zip_path = os.path.join(temp_dir, filename)
            
            cls.create_zip(raw_file, zip_path, os.path.basename(raw_file))

            # 3. Guardar en disco local SIEMPRE (Regla 3-2-1)
            local_dir = cls.get_local_storage_dir()
            dest_local = os.path.join(local_dir, filename)
            shutil.copy2(zip_path, dest_local)
            file_id = filename
            location = "Local"

            # 4. Subir a Google Drive como copia remota redundante
            drive_configured = GoogleDriveService.is_configured()
            if drive_configured:
                file_id = await GoogleDriveService.upload_backup(zip_path, filename)
                location = "Google Drive + Local"

            # 4. Actualizar estado
            setting.last_run_at = datetime.now()
            setting.last_status = "success"
            setting.last_message = f"Backup generado correctamente en {location}."
            await db.commit()

            # 5. Aplicar políticas de retención
            await cls.apply_retention_policy()

            return {
                "success": True,
                "file_id": file_id,
                "filename": filename,
                "location": location
            }

        except Exception as e:
            setting.last_run_at = datetime.now()
            setting.last_status = "error"
            setting.last_message = str(e)
            await db.commit()
            raise e
        finally:
            cls.clean_temp_dir()
            # Restaurar estado si se quedó en running (esto ya se cubre si hubo error o success, pero por si acaso)
            if setting and setting.last_status == "running":
                setting.last_status = "error"
                setting.last_message = "Proceso terminado inesperadamente"
                await db.commit()

    @classmethod
    def _get_file_from_backup_generation(cls) -> str:
        """Envuelve la generación para lanzar excepciones controladas."""
        return cls._execute_backup_raw()

    @classmethod
    async def restore_backup(cls, db: Session, file_id: str) -> Dict[str, Any]:
        """Descarga el backup, genera un respaldo del estado actual, e intenta restaurarlo.
        Si la restauración falla, hace rollback con el respaldo tomado."""
        if await cls.is_running(db):
            raise Exception("No se puede iniciar la restauración mientras se ejecuta otra operación de backup.")
        cls.clean_temp_dir()

        setting = (await db.execute(select(BackupSetting))).scalar_one_or_none()
        if not setting:
            setting = BackupSetting(frequency="daily")
            db.add(setting)
            await db.commit()

        setting.last_status = "running"
        setting.last_message = "Iniciando proceso de restauración..."
        await db.commit()

        backup_safety_path = None
        try:
            # 1. Crear backup de seguridad en caliente antes de restaurar
            setting.last_message = "Creando respaldo de seguridad temporal..."
            await db.commit()
            backup_safety_path = cls._execute_backup_raw()

            # 2. Descargar e identificar el ZIP a restaurar
            setting.last_message = "Descargando archivo de backup..."
            await db.commit()
            
            temp_dir = cls.get_temp_dir()
            zip_temp_path = os.path.join(temp_dir, "restore_target.zip")

            drive_configured = GoogleDriveService.is_configured()
            if drive_configured and not file_id.endswith(".zip"):
                # Es un ID de Drive
                file_bytes = await GoogleDriveService.download_backup(file_id)
                with open(zip_temp_path, "wb") as f:
                    f.write(file_bytes)
            else:
                # Es un backup local de fallback
                local_dir = cls.get_local_storage_dir()
                local_file_path = os.path.join(local_dir, file_id)
                if not os.path.exists(local_file_path):
                    # Probar si pasaron el nombre directamente
                    local_file_path = os.path.join(local_dir, os.path.basename(file_id))
                    
                if not os.path.exists(local_file_path):
                    raise Exception("Archivo de respaldo local no encontrado.")
                shutil.copy2(local_file_path, zip_temp_path)

            # 3. Descomprimir el ZIP
            setting.last_message = "Descomprimiendo archivos de base de datos..."
            await db.commit()
            
            extracted_dir = os.path.join(temp_dir, "extracted")
            os.makedirs(extracted_dir, exist_ok=True)
            extracted_file = cls.extract_zip(zip_temp_path, extracted_dir)

            # 4. Restaurar la base de datos
            setting.last_message = "Importando base de datos..."
            await db.commit()
            
            cls._execute_restore_raw(extracted_file)

            # Éxito absoluto
            setting.last_status = "success"
            setting.last_message = "Base de datos restaurada correctamente."
            await db.commit()

            return {"success": True, "message": "Restauración exitosa."}

        except Exception as e:
            # Ocurrió un error. Intentar Rollback usando el backup de seguridad
            error_message = f"Error en restauración: {str(e)}."
            print(error_message)
            
            if backup_safety_path and os.path.exists(backup_safety_path):
                try:
                    setting.last_message = f"Restauración fallida. Iniciando Rollback automático..."
                    await db.commit()
                    cls._execute_restore_raw(backup_safety_path)
                    error_message += " Se realizó rollback al estado anterior con éxito."
                except Exception as rollback_err:
                    error_message += f" Falló el rollback automático: {str(rollback_err)}. El sistema puede estar inestable."

            setting.last_status = "error"
            setting.last_message = error_message
            await db.commit()
            raise Exception(error_message)
            
        finally:
            cls.clean_temp_dir()
            if setting and setting.last_status == "running":
                setting.last_status = "error"
                setting.last_message = "Proceso restaurar terminado inesperadamente"
                await db.commit()

    @classmethod
    async def list_backups(cls) -> List[Dict[str, Any]]:
        """Lista todos los backups disponibles, ya sea en Google Drive o locales de fallback."""
        drive_configured = GoogleDriveService.is_configured()
        backups_list = []

        if drive_configured:
            try:
                drive_files = await GoogleDriveService.list_backups()
                for f in drive_files:
                    size_bytes = int(f.get("size", 0))
                    # Parsear la fecha de creación de Google Drive (ISO format)
                    created_time = datetime.fromisoformat(f.get("createdTime").replace("Z", "+00:00"))
                    backups_list.append({
                        "id": f.get("id"),
                        "name": f.get("name"),
                        "size": cls.format_size(size_bytes),
                        "size_bytes": size_bytes,
                        "created_time": created_time,
                        "location": "Google Drive",
                        "status": "success"
                    })
                return backups_list
            except Exception as e:
                print(f"Error listando de Drive, cayendo a local: {e}")

        # Local fallback o complementario
        local_dir = cls.get_local_storage_dir()
        if os.path.exists(local_dir):
            for filename in os.listdir(local_dir):
                if filename.endswith(".zip"):
                    file_path = os.path.join(local_dir, filename)
                    stat = os.stat(file_path)
                    created_time = datetime.fromtimestamp(stat.st_mtime)
                    backups_list.append({
                        "id": filename,
                        "name": filename,
                        "size": cls.format_size(stat.st_size),
                        "size_bytes": stat.st_size,
                        "created_time": created_time,
                        "location": "Local",
                        "status": "success"
                    })
        
        # Ordenar por fecha de creación desc
        backups_list.sort(key=lambda x: x["created_time"], reverse=True)
        return backups_list

    @classmethod
    async def delete_backup(cls, file_id: str):
        """Elimina un backup de Drive o del directorio local."""
        drive_configured = GoogleDriveService.is_configured()
        
        if drive_configured and not file_id.endswith(".zip"):
            await GoogleDriveService.delete_backup(file_id)
        else:
            local_dir = cls.get_local_storage_dir()
            file_path = os.path.join(local_dir, file_id)
            if not os.path.exists(file_path):
                # Probar con basename
                file_path = os.path.join(local_dir, os.path.basename(file_id))
            if os.path.exists(file_path):
                os.remove(file_path)
            else:
                raise Exception("Archivo no encontrado en almacenamiento local.")

    @classmethod
    async def download_backup(cls, file_id: str) -> Tuple[bytes, str]:
        """Obtiene el binario de descarga y el nombre del archivo correspondientes."""
        drive_configured = GoogleDriveService.is_configured()
        
        if drive_configured and not file_id.endswith(".zip"):
            # Obtener metadatos para el nombre
            access_token = await GoogleDriveService._get_access_token()
            url = f"https://www.googleapis.com/drive/v3/files/{file_id}"
            headers = {"Authorization": f"Bearer {access_token}"}
            
            async with httpx.AsyncClient() as client:
                resp = await client.get(url, headers=headers)
                filename = resp.json().get("name", "backup.zip") if resp.status_code == 200 else "backup.zip"
                
            content = await GoogleDriveService.download_backup(file_id)
            return content, filename
        else:
            local_dir = cls.get_local_storage_dir()
            file_path = os.path.join(local_dir, file_id)
            if not os.path.exists(file_path):
                file_path = os.path.join(local_dir, os.path.basename(file_id))
            if os.path.exists(file_path):
                with open(file_path, "rb") as f:
                    content = f.read()
                return content, os.path.basename(file_path)
            else:
                raise Exception("Archivo de backup no encontrado.")

    @classmethod
    async def apply_retention_policy(cls):
        """Aplica la retención de backups eliminando los más antiguos y manteniendo un límite máximo de 40 archivos.
        Protege siempre el backup correcto más reciente para no dejar el sistema sin respaldos."""
        try:
            backups = await cls.list_backups()
            if len(backups) <= 40:
                return

            # Eliminar los excedentes más antiguos.
            # Ordenados de más nuevo a más antiguo, por lo que los excedentes están al final.
            to_delete = backups[40:]
            
            # El más reciente (índice 0) está protegido automáticamente por no estar en to_delete
            for item in to_delete:
                print(f"Retención: Eliminando backup antiguo {item['name']}")
                await cls.delete_backup(item["id"])
        except Exception as e:
            print(f"Error aplicando política de retención: {e}")
