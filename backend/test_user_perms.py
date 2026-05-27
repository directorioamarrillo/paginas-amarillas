import asyncio
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.db.conexion import async_session
from app.models import models

async def main():
    async with async_session() as session:
        result = await session.execute(
            select(models.Usuario)
            .options(selectinload(models.Usuario.rol_obj).selectinload(models.Rol.permisos))
            .where(models.Usuario.correo == 'directorioamarrillo@gmail.com')
        )
        user = result.scalars().first()
        if user:
            print("User found:", user.correo)
            print("Role:", user.rol_obj.nombre)
            print("Permisos:", [p.key for p in user.rol_obj.permisos])
        else:
            print("User not found")

if __name__ == "__main__":
    asyncio.run(main())
