import asyncio
from seeders._execute import run_sql_statements
from seeders.seed_admin_user import seed_admin_user

async def restore():
    await seed_admin_user(run_sql_statements)
    print("Usuario admin restaurado.")

if __name__ == "__main__":
    asyncio.run(restore())
