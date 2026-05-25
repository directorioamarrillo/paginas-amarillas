import httpx
import json
from app.core.config import settings

class GoogleDriveService:
    @staticmethod
    def is_configured() -> bool:
        return bool(
            settings.GOOGLE_DRIVE_CLIENT_ID and
            settings.GOOGLE_DRIVE_CLIENT_SECRET and
            settings.GOOGLE_DRIVE_REFRESH_TOKEN and
            settings.GOOGLE_DRIVE_FOLDER_ID
        )

    @staticmethod
    async def _get_access_token() -> str:
        if not GoogleDriveService.is_configured():
            raise Exception("Google Drive is not fully configured in environment variables.")

        url = "https://oauth2.googleapis.com/token"
        data = {
            "client_id": settings.GOOGLE_DRIVE_CLIENT_ID,
            "client_secret": settings.GOOGLE_DRIVE_CLIENT_SECRET,
            "refresh_token": settings.GOOGLE_DRIVE_REFRESH_TOKEN,
            "grant_type": "refresh_token",
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, data=data, timeout=15.0)
                if response.status_code != 200:
                    raise Exception(f"Google Token endpoint returned {response.status_code}: {response.text}")
                return response.json().get("access_token")
            except Exception as e:
                raise Exception(f"Failed to refresh Google Drive access token: {str(e)}")

    @staticmethod
    async def upload_backup(file_path: str, filename: str) -> str:
        access_token = await GoogleDriveService._get_access_token()
        
        # Leer el archivo a subir
        with open(file_path, "rb") as f:
            file_data = f.read()

        # Endpoint de Google Drive API v3
        url = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart"
        headers = {
            "Authorization": f"Bearer {access_token}",
        }
        
        # Construimos el cuerpo multipart manualmente
        boundary = "foo_bar_baz_backup_boundary"
        headers["Content-Type"] = f"multipart/related; boundary={boundary}"
        
        metadata = {
            "name": filename,
            "parents": [settings.GOOGLE_DRIVE_FOLDER_ID]
        }
        
        metadata_json = json.dumps(metadata)
        
        # Armando los bytes multipart
        body = (
            f"--{boundary}\r\n"
            f"Content-Type: application/json; charset=UTF-8\r\n\r\n"
            f"{metadata_json}\r\n"
            f"--{boundary}\r\n"
            f"Content-Type: application/zip\r\n\r\n"
        ).encode("utf-8") + file_data + f"\r\n--{boundary}--\r\n".encode("utf-8")
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, content=body, timeout=float(settings.BACKUP_PROCESS_TIMEOUT))
            if response.status_code != 200:
                raise Exception(f"Upload failed: {response.text}")
            return response.json().get("id")

    @staticmethod
    async def list_backups() -> list:
        if not GoogleDriveService.is_configured():
            return []
            
        access_token = await GoogleDriveService._get_access_token()
        
        url = "https://www.googleapis.com/drive/v3/files"
        headers = {
            "Authorization": f"Bearer {access_token}"
        }
        params = {
            "q": f"'{settings.GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed = false and name contains '.zip'",
            "fields": "files(id, name, size, createdTime)",
            "orderBy": "createdTime desc",
            "pageSize": 100
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, params=params, timeout=15.0)
            if response.status_code != 200:
                raise Exception(f"List files failed: {response.text}")
            return response.json().get("files", [])

    @staticmethod
    async def download_backup(file_id: str) -> bytes:
        access_token = await GoogleDriveService._get_access_token()
        
        url = f"https://www.googleapis.com/drive/v3/files/{file_id}"
        headers = {
            "Authorization": f"Bearer {access_token}"
        }
        params = {
            "alt": "media"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, params=params, timeout=None)
            if response.status_code != 200:
                raise Exception(f"Download failed: {response.text}")
            return response.content

    @staticmethod
    async def delete_backup(file_id: str) -> bool:
        access_token = await GoogleDriveService._get_access_token()
        
        url = f"https://www.googleapis.com/drive/v3/files/{file_id}"
        headers = {
            "Authorization": f"Bearer {access_token}"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.delete(url, headers=headers, timeout=15.0)
            if response.status_code not in (200, 204):
                raise Exception(f"Delete failed: {response.text}")
            return True
