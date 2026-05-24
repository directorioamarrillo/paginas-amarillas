import os
from dotenv import load_dotenv
load_dotenv()
# defaults
os.environ.setdefault('USER','postgres')
os.environ.setdefault('PASSWORD','123456')
os.environ.setdefault('HOST','localhost')
os.environ.setdefault('DATABASE','directorio')
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

engine = create_async_engine(f"postgresql+asyncpg://{os.environ['USER']}:{os.environ['PASSWORD']}@{os.environ['HOST']}/{os.environ['DATABASE']}", echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
async def run_sql_statements(statements):
    async with async_session() as session:
        async with session.begin():
            for s in statements:
                await session.execute(s)
        await session.commit()

import seeders.seed_roles as sr
import asyncio

async def main():
    print('Seeding roles (associations)...')
    await sr.seed_roles(run_sql_statements)
    print('Done')

asyncio.run(main())
