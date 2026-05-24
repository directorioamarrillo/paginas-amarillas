"""Script para crear datos de ejemplo en la base de datos."""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from api.db.conexion import SessionLocal
from api.models.models import Categoria, Departamento, Municipio, Empresa

def seed_database():
    db = SessionLocal()
    
    try:
        # Limpiar verificación - siempre crear si no hay
        existing_empresas = db.query(Empresa).count()
        print(f"📊 Empresas existentes: {existing_empresas}")
        
        if existing_empresas > 0:
            print("✓ Ya existen empresas en la base de datos")
            empresas = db.query(Empresa).all()
            for e in empresas:
                print(f"   - {e.nombre}")
            return
        
        # Crear categoría
        cat = Categoria(nombre="Restaurantes", descripcion="Comidas y bebidas")
        db.add(cat)
        db.flush()
        print(f"✓ Categoría creada: ID {cat.id_categoria}")
        
        # Crear departamento
        dept = Departamento(nombre="Antioquia")
        db.add(dept)
        db.flush()
        print(f"✓ Departamento creado: ID {dept.id_departamento}")
        
        # Crear municipio
        mun = Municipio(nombre="Medellín", id_departamento=dept.id_departamento)
        db.add(mun)
        db.flush()
        print(f"✓ Municipio creado: ID {mun.id_municipio}")
        
        # Crear empresas de ejemplo
        empresas_data = [
            {
                "nombre": "El Buen Sabor",
                "nit": "900123456-7",
                "correo": "contacto@elbuensabor.com",
                "direccion": "Calle 50 # 45-30",
                "telefono": "3001234567",
                "logo": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400"
            },
            {
                "nombre": "Café Central",
                "nit": "900765432-1",
                "correo": "info@cafecentral.com",
                "direccion": "Carrera 43A # 1-50",
                "telefono": "3009876543",
                "logo": "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400"
            },
            {
                "nombre": "Pizza Express",
                "nit": "900555123-4",
                "correo": "pedidos@pizzaexpress.com",
                "direccion": "Avenida 80 # 30-15",
                "telefono": "3005551234",
                "logo": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400"
            },
            {
                "nombre": "Sushi Bar Zen",
                "nit": "900777888-9",
                "correo": "reservas@sushibarzen.com",
                "direccion": "Calle 10 # 38-50",
                "telefono": "3007778899",
                "logo": "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400"
            }
        ]
        
        for data in empresas_data:
            empresa = Empresa(
                **data,
                id_categoria=cat.id_categoria,
                id_municipio=mun.id_municipio
            )
            db.add(empresa)
            db.flush()
            print(f"✓ Empresa creada: ID {empresa.id_empresa} - {empresa.nombre}")
        
        db.commit()
        print("\n✅ Datos de ejemplo creados exitosamente!")
        print(f"   - 1 Categoría: {cat.nombre}")
        print(f"   - 1 Departamento: {dept.nombre}")
        print(f"   - 1 Municipio: {mun.nombre}")
        print(f"   - {len(empresas_data)} Empresas")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error al crear datos: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
