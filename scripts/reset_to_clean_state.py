"""Script para respaldar y limpiar la base de datos local.

Acciones:
- Exporta a JSON los contenidos de las tablas principales (usuarios, empresas, publicidades, marketplaces, reviews, resultados, mensajes, comprobantes, notificaciones, usuarios_favoritos).
- Elimina entradas en orden seguro para evitar violaciones FK.
- Conserva al menos un usuario admin (correo admin@admin.com) y los roles/permisos.
- Ejecuta los seeders para restaurar admin, roles y datos esenciales.

USO:
> python scripts/reset_to_clean_state.py

Asegúrate de ejecutar desde la raíz del repo y tener las variables de entorno DB configuradas (USER, PASSWORD, HOST, DATABASE).
"""

import asyncio
import json
import os
import sys
from datetime import datetime

# Ensure 'server' is on the Python path so imports like 'api.db.conexion' work
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SERVER_PATH = os.path.join(ROOT, 'server')
if SERVER_PATH not in sys.path:
    sys.path.insert(0, SERVER_PATH)

from api.db.conexion import async_session
from api.models.models import (
    Usuario, Empresa, Publicidad, ImagenPublicidad, Marketplace, ImagenMarketplace,
    Mensaje, ArchivoMensaje, Comprobante, Review, Resultado, UsuarioFavorito, Notificacion,
    EventoMarketplace
)

BACKUP_DIR = os.path.join('backups', datetime.utcnow().strftime('%Y%m%d_%H%M%S'))

os.makedirs(BACKUP_DIR, exist_ok=True)

async def fetch_all(session, model):
    result = await session.execute(model.__table__.select())
    rows = [dict(r) for r in result.mappings().all()]
    return rows

async def run():
    async with async_session() as session:
        async with session.begin():
            # 1) Backup tables
            tables = [Usuario, Empresa, Publicidad, ImagenPublicidad, Marketplace, ImagenMarketplace,
                      Mensaje, ArchivoMensaje, Comprobante, Review, Resultado, UsuarioFavorito, Notificacion, EventoMarketplace]
            for model in tables:
                name = model.__tablename__
                print(f'Backing up {name}...')
                rows = await fetch_all(session, model)
                with open(os.path.join(BACKUP_DIR, f'{name}.json'), 'w', encoding='utf-8') as f:
                    json.dump(rows, f, default=str, ensure_ascii=False, indent=2)

            # 2) Delete in safe order
            print('Deleting dependent data...')
            # usuarios_favoritos
            await session.execute(UsuarioFavorito.__table__.delete())
            # eventos_marketplace
            await session.execute(EventoMarketplace.__table__.delete())
            # imagenes_publicidad
            await session.execute(ImagenPublicidad.__table__.delete())
            # imagenes_marketplace
            await session.execute(ImagenMarketplace.__table__.delete())
            # archivos_mensajes
            await session.execute(ArchivoMensaje.__table__.delete())
            # comprobantes
            await session.execute(Comprobante.__table__.delete())
            # mensajes
            await session.execute(Mensaje.__table__.delete())
            # publicidades
            await session.execute(Publicidad.__table__.delete())
            # reviews
            await session.execute(Review.__table__.delete())
            # resultados
            await session.execute(Resultado.__table__.delete())
            # marketplaces
            await session.execute(Marketplace.__table__.delete())

            # Romper referencias circulares: establecer referencias a NULL cuando sean nullable
            print('Nullifying FK fields (id_empresa, id_usuario_creador) to avoid FK violations...')
            await session.execute(Usuario.__table__.update().values(id_empresa=None))
            await session.execute(Empresa.__table__.update().values(id_usuario_creador=None))

            # empresas (delete all)
            await session.execute(Empresa.__table__.delete())

            # usuarios: keep admin(s) by correo admin@admin.com
            print('Cleaning usuarios (keeping admin@admin.com)...')
            await session.execute(Usuario.__table__.delete().where(Usuario.correo != 'admin@admin.com'))

        await session.commit()

    print('Deletes committed. Creating minimal placeholder users (ids 2,3) to satisfy seeders, then running seeders...')
    # Create placeholder users with ids 2 and 3 so seed_auditoria can insert audit entries referencing them
    async with async_session() as session:
        async with session.begin():
            # check if users exist
            res = await session.execute(Usuario.__table__.select().where(Usuario.id == 2))
            if not res.first():
                await session.execute(Usuario.__table__.insert().values(id=2, nombre='Comercio', apellido='Placeholder', correo='comercio@example.com', password='placeholder', id_rol=None, id_empresa=None))
            res = await session.execute(Usuario.__table__.select().where(Usuario.id == 3))
            if not res.first():
                await session.execute(Usuario.__table__.insert().values(id=3, nombre='User', apellido='Placeholder', correo='user@example.com', password='placeholder', id_rol=None, id_empresa=None))
        await session.commit()

    # Run seeder script to recreate roles/admin/permisos
    # Use module execution to run server/seeders/_execute.py
    # Run as subprocess to reuse env
    import subprocess, sys
    script = os.path.join('server', 'seeders', '_execute.py')
    py_exec = sys.executable
    print('Running seeders with:', py_exec, script)
    subprocess.run([py_exec, script], check=True)
    print('Seeders executed. Clean state achieved. Backups in:', BACKUP_DIR)

if __name__ == '__main__':
    asyncio.run(run())
