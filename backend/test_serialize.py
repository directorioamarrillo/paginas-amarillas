import asyncio
from sqlalchemy import select
from sqlalchemy.orm import selectinload, joinedload
from app.db.conexion import async_session
from app.models import models
from app.schemas.schemas import EmpresaResponseGet

async def main():
    async with async_session() as session:
        result = await session.execute(
            select(models.Empresa)
            .options(
                joinedload(models.Empresa.categoria),
                joinedload(models.Empresa.municipio),
                selectinload(models.Empresa.imagenes)
            )
            .where(models.Empresa.id == 10)
        )
        empresa = result.scalars().first()
        if empresa:
            print("Empresa db deleted_at:", empresa.deleted_at)
            
            # Serialize
            schema = EmpresaResponseGet.model_validate(empresa)
            print("Schema deleted_at:", schema.deleted_at)
            print("Schema dict:", schema.model_dump())
        else:
            print("Empresa not found")

if __name__ == "__main__":
    asyncio.run(main())
