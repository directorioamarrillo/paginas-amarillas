"""Asegura un único usuario admin con contraseña conocida.

Uso:
  .\server\venv\Scripts\python.exe .\scripts\ensure_single_admin.py

El script toma las variables de entorno definidas en `server/.env` (cargadas por `api.db.conexion`).
"""
import asyncio
from datetime import datetime
import os

from pwdlib import PasswordHash

from api.db import conexion
from api.models import models
from sqlalchemy import update, text


ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@admin.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "12345678")
ADMIN_NAME = os.environ.get("ADMIN_NAME", "Administrador")
ADMIN_LASTNAME = os.environ.get("ADMIN_LASTNAME", "Sistema")


async def main():
    pwd = PasswordHash.recommended()
    hashed = pwd.hash(ADMIN_PASSWORD)

    async with conexion.async_session() as session:
        # Upsert admin user
        result = await session.execute(
            text("SELECT id FROM usuarios WHERE correo = :correo"),
            {"correo": ADMIN_EMAIL},
        )
        row = result.first()
        now = datetime.utcnow()
        if row:
            uid = row[0]
            await session.execute(
                update(models.Usuario)
                .where(models.Usuario.id == uid)
                .values(
                    nombre=ADMIN_NAME,
                    apellido=ADMIN_LASTNAME,
                    password=hashed,
                    id_rol=1,
                    id_empresa=None,
                    deleted_at=None,
                )
            )
            print(f"Actualizado admin existente: {ADMIN_EMAIL} (id={uid})")
        else:
            new = models.Usuario(
                nombre=ADMIN_NAME,
                apellido=ADMIN_LASTNAME,
                correo=ADMIN_EMAIL,
                id_rol=1,
                id_empresa=None,
                password=hashed,
            )
            session.add(new)
            await session.flush()
            print(f"Creado nuevo admin: {ADMIN_EMAIL} (id provisional)")

        # Marcar como eliminados todos los demás usuarios
        await session.execute(
            update(models.Usuario)
            .where(models.Usuario.correo != ADMIN_EMAIL)
            .values(deleted_at=now)
        )

        # Opcional: marcar empresas como eliminadas
        try:
            await session.execute(
                update(models.Empresa).values(deleted_at=now)
            )
        except Exception:
            pass

        await session.commit()

    print("Operación completada. Admin listo.")


if __name__ == "__main__":
    asyncio.run(main())
