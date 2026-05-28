import asyncio
from app.db.conexion import engine
from sqlalchemy import text
async def query():
    async with engine.begin() as conn:
        result = await conn.execute(text("SELECT correo, verification_code, is_verified FROM usuarios WHERE correo='luislopera196@gmail.com'"))
        print(result.fetchall())
asyncio.run(query())
