import asyncio
from app.db.conexion import async_session
from app.services.backup_service import BackupService

async def test():
    async with async_session() as session:
        result = await BackupService.generate_backup(session)
        print(result)

if __name__ == "__main__":
    asyncio.run(test())
