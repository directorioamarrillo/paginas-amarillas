import os
import asyncio
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
import sys
sys.path.append(os.path.dirname(__file__))
from seed_permisos import seed_permisos

load_dotenv()

USER = os.environ.get("USER")
PASSWORD = os.environ.get("PASSWORD")
HOST = os.environ.get("HOST")
DATABASE = os.environ.get("DATABASE")

engine = create_async_engine(f"postgresql+asyncpg://{USER}:{PASSWORD}@{HOST}/{DATABASE}")
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def run_sql_statements(statements):
    async with async_session() as session:
        async with session.begin():
            for statement in statements:
                await session.execute(statement)
        await session.commit()

async def main():
    print("Running permissions seeder...")
    await seed_permisos(run_sql_statements)
    print("Seeding complete.")

if __name__ == "__main__":
    asyncio.run(main())
