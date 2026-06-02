import asyncio
from app.db.conexion import async_session
from app.models.models import Empresa, Marketplace

async def main():
    async with async_session() as session:
        # Define the companies to insert
        companies_to_create = [
            {
                "nombre": "Cafecito Gourmet",
                "nit": "900123456-1",
                "correo": "contacto@cafecitogourmet.com",
                "direccion": "Calle 45 # 15-20, Chapinero",
                "telefono": "3101234567",
                "id_categoria": 30, # Cafetería
                "id_municipio": 1121, # Bogotá
                "id_usuario_creador": 1,
                "estado": "activa",
                "logo_url": None
            },
            {
                "nombre": "El Fogón Criollo",
                "nit": "900123456-2",
                "correo": "info@elfogoncriollo.com",
                "direccion": "Carrera 7 # 72-10, Zona G",
                "telefono": "3159876543",
                "id_categoria": 31, # Restaurantes
                "id_municipio": 1121, # Bogotá
                "id_usuario_creador": 1,
                "estado": "activa",
                "logo_url": None
            },
            {
                "nombre": "Dulzura Artesanal",
                "nit": "900123456-3",
                "correo": "ventas@dulzuraartesanal.com",
                "direccion": "Calle 100 # 19-45, Chicó",
                "telefono": "3004567890",
                "id_categoria": 37, # Panadería y Repostería
                "id_municipio": 1121, # Bogotá
                "id_usuario_creador": 1,
                "estado": "activa",
                "logo_url": None
            }
        ]

        inserted_companies = []
        for co in companies_to_create:
            emp = Empresa(
                nombre=co["nombre"],
                nit=co["nit"],
                correo=co["correo"],
                direccion=co["direccion"],
                telefono=co["telefono"],
                id_categoria=co["id_categoria"],
                id_municipio=co["id_municipio"],
                id_usuario_creador=co["id_usuario_creador"],
                estado=co["estado"],
                logo_url=co["logo_url"]
            )
            session.add(emp)
            inserted_companies.append(emp)
        
        # Flush to get the company IDs
        await session.flush()

        # Define products for each company
        products_to_create = [
            # Cafecito Gourmet (index 0)
            {
                "nombre": "Café Latte de la Casa",
                "descripcion": "Delicioso espresso mezclado con leche vaporizada y una fina capa de espuma, preparado con granos de origen especial.",
                "precio": 8500.0,
                "stock": 100.0,
                "id_estado": 1, # Activo
                "id_categoria": 30,
                "empresa_index": 0
            },
            {
                "nombre": "Capuchino Italiano",
                "descripcion": "Espresso intenso con partes iguales de leche vaporizada y espuma de leche, espolvoreado con cacao fino.",
                "precio": 9000.0,
                "stock": 80.0,
                "id_estado": 1, # Activo
                "id_categoria": 30,
                "empresa_index": 0
            },
            # El Fogón Criollo (index 1)
            {
                "nombre": "Bandeja Paisa Tradicional",
                "descripcion": "El plato típico por excelencia: frijol cargamanto, arroz blanco, carne molida, chicharrón crujiente, huevo frito, tajada de plátano, chorizo y arepa.",
                "precio": 28000.0,
                "stock": 50.0,
                "id_estado": 1, # Activo
                "id_categoria": 31,
                "empresa_index": 1
            },
            {
                "nombre": "Ajiaco Santafereño",
                "descripcion": "Sopa tradicional bogotana con tres tipos de papa, pollo desmechado, mazorca, servido con crema de leche, alcaparras y aguacate.",
                "precio": 24000.0,
                "stock": 40.0,
                "id_estado": 1, # Activo
                "id_categoria": 31,
                "empresa_index": 1
            },
            # Dulzura Artesanal (index 2)
            {
                "nombre": "Torta Tres Leches Familiar",
                "descripcion": "Bizcocho húmedo bañado en tres tipos de leche (leche evaporada, crema de leche y leche condensada), cubierto con merengue suizo.",
                "precio": 45000.0,
                "stock": 15.0,
                "id_estado": 1, # Activo
                "id_categoria": 37,
                "empresa_index": 2
            },
            {
                "nombre": "Croissant de Almendras",
                "descripcion": "Hojaldre francés clásico crujiente, relleno de crema frangipane de almendras y decorado con almendras fileteadas tostadas.",
                "precio": 7500.0,
                "stock": 30.0,
                "id_estado": 1, # Activo
                "id_categoria": 37,
                "empresa_index": 2
            }
        ]

        for prod in products_to_create:
            emp_obj = inserted_companies[prod["empresa_index"]]
            marketplace_item = Marketplace(
                nombre=prod["nombre"],
                descripcion=prod["descripcion"],
                precio=prod["precio"],
                stock=prod["stock"],
                id_estado=prod["id_estado"],
                id_empresa=emp_obj.id,
                id_categoria=prod["id_categoria"]
            )
            session.add(marketplace_item)

        await session.commit()
        print("Registros creados exitosamente en la base de datos.")

if __name__ == "__main__":
    asyncio.run(main())
