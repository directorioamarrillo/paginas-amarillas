import asyncio
from sqlalchemy.future import select
from app.db.conexion import async_session
from app.models.models import Categoria

async def clean_emojis():
    async with async_session() as db:
        result = await db.execute(select(Categoria))
        categorias = result.scalars().all()
        for c in categorias:
            # Si el nombre tiene un espacio en los primeros caracteres, probablemente sea un emoji + espacio
            if " " in c.nombre:
                parts = c.nombre.split(" ", 1)
                # Si la primera parte no es una letra (es un emoji)
                if not parts[0].isalnum():
                    new_name = parts[1].strip()
                    c.nombre = new_name
        await db.commit()

if __name__ == "__main__":
    asyncio.run(clean_emojis())
