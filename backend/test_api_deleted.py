import httpx
import asyncio
import json

async def main():
    async with httpx.AsyncClient() as client:
        # Get token
        resp = await client.post("http://localhost:8000/api/auth/login", data={"username": "directorioamarrillo@gmail.com", "password": "Admin123()"})
        token = resp.json().get("access_token")
        print("Token:", token[:10] if token else None)
        
        # Request empresas
        headers = {"Authorization": f"Bearer {token}"}
        resp = await client.get("http://localhost:8000/api/empresas/?limit=100", headers=headers)
        data = resp.json()
        
        # Check deleted_at
        for d in data:
            if d.get("id") == 10:
                print("Empresa 10 (EduCenter) deleted_at:", d.get("deleted_at"))
                print("Empresa 10 full dict keys:", list(d.keys()))
                
if __name__ == "__main__":
    asyncio.run(main())
