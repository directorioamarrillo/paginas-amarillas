"""Script para listar y crear más empresas de ejemplo."""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from api.db.conexion import SessionLocal
from api.models.models import Categoria, Departamento, Municipio, Empresa

def list_and_seed():
    db = SessionLocal()
    
    try:
        empresas = db.query(Empresa).all()
        print(f"\n📊 Total empresas actuales: {len(empresas)}")
        
        for e in empresas:
            print(f"   - {e.nombre} (ID: {e.id_empresa})")
        
        if len(empresas) >= 2:
            print("\n✓ Ya hay suficientes empresas para visualizar")
            return
        
        # Obtener IDs existentes
        cat = db.query(Categoria).first()
        mun = db.query(Municipio).first()
        
        if not cat or not mun:
            print("❌ Falta categoría o municipio base")
            return
        
        # Crear más empresas
        nuevas = [
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
        
        for data in nuevas:
            empresa = Empresa(
                **data,
                id_categoria=cat.id_categoria,
                id_municipio=mun.id_municipio
            )
            db.add(empresa)
            db.flush()
            print(f"✓ Empresa creada: {empresa.nombre}")
        
        db.commit()
        print(f"\n✅ {len(nuevas)} nuevas empresas agregadas!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    list_and_seed()
