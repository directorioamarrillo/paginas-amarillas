import asyncio
import ssl
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def test_conn():
    DB_USER = "avnadmin"
    DB_PASSWORD = "AVNS_0a3qFuEFVgnV_jMh3bB"
    DB_HOST = "pg-3dabafe9-directorioamarillo-b996.f.aivencloud.com"
    DB_PORT = "13053"
    DB_NAME = "defaultdb"

    DATABASE_URL = f"postgresql+asyncpg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    print(f"Testing connection to: {DB_HOST}:{DB_PORT} (DB: {DB_NAME})")

    ssl_ctx = ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE

    connect_args = {"ssl": ssl_ctx}

    engine = create_async_engine(DATABASE_URL, connect_args=connect_args)

    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            val = result.scalar()
            print(f"SUCCESS! Database returned: {val}")
    except Exception as e:
        print("ERROR CONNECTING TO DATABASE:")
        import traceback
        traceback.print_exc()
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test_conn())
