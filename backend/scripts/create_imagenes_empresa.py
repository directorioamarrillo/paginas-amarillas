import asyncio
import sys
import os

sys.path.append(r"c:\Users\santi\Documents\DIRECTORIO2.0\backend")

from app.db.conexion import engine, Base
from app.models.models import ImagenEmpresa  # Ensure the model is imported so it registers with Base

async def create_table():
    print("Initializing table creation for 'imagenes_empresa'...")
    try:
        async with engine.begin() as conn:
            # create_all only creates tables that do not exist yet
            await conn.run_sync(Base.metadata.create_all)
            print("Table check/creation completed successfully!")
    except Exception as e:
        print(f"Error creating table: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(create_table())
