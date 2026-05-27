import asyncio
import os
import sys
from sqlalchemy import text

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SERVER_PATH = os.path.join(ROOT, 'server')
if SERVER_PATH not in sys.path:
    sys.path.insert(0, SERVER_PATH)

from api.db.conexion import async_session

async def main():
    async with async_session() as session:
        async with session.begin():
            # find admin id
            res = await session.execute(text("SELECT id FROM usuarios WHERE correo='admin@admin.com' LIMIT 1"))
            row = res.first()
            admin_id = row[0] if row else None
            if admin_id is None:
                print('No admin user found; nullifying all audit.usuario_id')
                await session.execute(text('UPDATE audit_logs SET usuario_id = NULL'))
            else:
                print(f'Admin id = {admin_id}; nullifying other audit references...')
                await session.execute(text('UPDATE audit_logs SET usuario_id = NULL WHERE usuario_id != :admin').bindparams(admin=admin_id))
        await session.commit()
    print('audit_logs.usuario_id cleaned')

if __name__ == '__main__':
    asyncio.run(main())
