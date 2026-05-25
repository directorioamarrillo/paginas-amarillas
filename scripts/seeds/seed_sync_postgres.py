"""
Seeder sincrónico para datos de prueba
Ejecutar: python seed_sync_postgres.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "backend"))

from sqlalchemy import create_engine, select, text
from sqlalchemy.orm import sessionmaker
from datetime import datetime

from app.models.models import (
    Categoria, Empresa, Marketplace, Rol, Permiso, 
    Departamento, Municipio, EstadoMarketplace, Usuario, Pais
)
from app.db.conexion import Base
from app.api.auth import hash_password
from app.core.config import settings

# Convertir URL async a sync si es necesario
db_url = settings.SQLALCHEMY_DATABASE_URL
if "asyncpg" in db_url:
    db_url = db_url.replace("postgresql+asyncpg://", "postgresql://")
elif db_url.startswith("sqlite+aiosqlite"):
    db_url = db_url.replace("sqlite+aiosqlite:///", "sqlite:///")

print(f"Conectando a: {db_url}")

engine = create_engine(db_url, echo=False)
Base.metadata.create_all(engine)

Session = sessionmaker(bind=engine)
session = Session()

def main():
    print("=== SEED TEST DATA ===\n")
    
    try:
        # Verificar si hay datos ya
        categorias_existentes = session.query(Categoria).all()
        
        if categorias_existentes:
            print("⚠ Los datos ya existen. Abortando.")
            session.close()
            return
        
        # ====== PAÍS ======
        pais = Pais(nombre="Colombia", codigo_iso="CO")
        session.add(pais)
        session.flush()
        print("✓ País creado")
        
        # ====== DEPARTAMENTO ======
        departamento = Departamento(nombre="Bogotá D.C.", id_pais=pais.id)
        session.add(departamento)
        session.flush()
        
        # ====== MUNICIPIO ======
        municipio = Municipio(nombre="Bogotá", id_departamento=departamento.id)
        session.add(municipio)
        session.flush()
        print("✓ Departamento y Municipio creados\n")
        
        # ====== CATEGORÍAS ======
        print("--- Categorías ---")
        categorias_data = [
            ("Tecnología", "Productos y servicios tecnológicos"),
            ("Salud", "Servicios de salud y bienestar"),
            ("Educación", "Servicios educativos y formación")
        ]
        
        categorias = []
        for nombre, desc in categorias_data:
            cat = Categoria(nombre=nombre, descripcion=desc)
            session.add(cat)
            categorias.append(cat)
            print(f"  ✓ {nombre}")
        
        session.flush()
        print()
        
        # ====== ESTADO MARKETPLACE ======
        print("--- Estados Marketplace ---")
        estados_data = [
            ("Activo", "Producto activo y disponible"),
            ("Inactivo", "Producto inactivo"),
            ("Sin stock", "Producto sin inventario")
        ]
        
        estados = []
        for nombre, desc in estados_data:
            est = EstadoMarketplace(nombre=nombre, descripcion=desc)
            session.add(est)
            estados.append(est)
            print(f"  ✓ {nombre}")
        
        session.flush()
        print()
        
        # ====== USUARIO ADMIN ======
        usuario_admin = Usuario(
            nombre="Admin",
            apellido="Sistema",
            correo="admin@admin.com",
            password=hash_password("admin123"),
            id_rol=None
        )
        session.add(usuario_admin)
        session.flush()
        print("✓ Usuario admin creado\n")
        
        # ====== EMPRESAS ======
        print("--- Empresas ---")
        empresas_data = [
            ("TechCorp", "123456789", "techcorp@company.com", "Calle 1 No 100", "3001234567", 0),
            ("HealthPlus", "987654321", "healthplus@company.com", "Calle 2 No 200", "3007654321", 1),
            ("EduCenter", "555666777", "educenter@company.com", "Calle 3 No 300", "3009876543", 2)
        ]
        
        empresas = []
        for nombre, nit, correo, direccion, telefono, cat_idx in empresas_data:
            emp = Empresa(
                nombre=nombre,
                nit=nit,
                correo=correo,
                direccion=direccion,
                telefono=telefono,
                id_categoria=categorias[cat_idx].id,
                id_municipio=municipio.id,
                id_usuario_creador=usuario_admin.id
            )
            session.add(emp)
            empresas.append(emp)
            print(f"  ✓ {nombre}")
        
        session.flush()
        print()
        
        # ====== MARKETPLACE ======
        print("--- Marketplace Items ---")
        marketplace_data = [
            ("Laptop Dell", "Laptop de alta performance", 1200.00, 10, 0, 0),
            ("Consulta Médica", "Consulta médica general", 50.00, 100, 1, 1),
            ("Curso Online", "Curso de programación Python", 99.99, 1000, 2, 2)
        ]
        
        for nombre, desc, precio, stock, emp_idx, cat_idx in marketplace_data:
            market = Marketplace(
                nombre=nombre,
                descripcion=desc,
                precio=precio,
                stock=stock,
                id_estado=estados[0].id,  # Activo
                id_empresa=empresas[emp_idx].id,
                id_categoria=categorias[cat_idx].id,
                fecha_publicacion=datetime.utcnow()
            )
            session.add(market)
            print(f"  ✓ {nombre}")
        
        session.flush()
        print()
        
        # ====== ROLES ======
        print("--- Roles ---")
        roles_data = [
            ("Administrador", "Usuario con acceso total"),
            ("Vendedor", "Usuario que puede vender productos"),
            ("Cliente", "Usuario cliente regular")
        ]
        
        for nombre, desc in roles_data:
            rol = Rol(nombre=nombre, descripcion=desc)
            session.add(rol)
            print(f"  ✓ {nombre}")
        
        session.flush()
        print()
        
        # ====== PERMISOS ======
        print("--- Permisos ---")
        permisos_data = [
            ("CREAR_EMPRESA", "Permiso para crear empresas"),
            ("MODIFICAR_EMPRESA", "Permiso para modificar empresas"),
            ("ELIMINAR_EMPRESA", "Permiso para eliminar empresas")
        ]
        
        for key, desc in permisos_data:
            perm = Permiso(key=key, descripcion=desc)
            session.add(perm)
            print(f"  ✓ {key}")
        
        session.flush()
        print()
        
        # Commit final
        session.commit()
        
        print("=== SEED COMPLETADO ===")
        print(f"✓ 3 Categorías creadas")
        print(f"✓ 3 Empresas creadas")
        print(f"✓ 3 Marketplace items creados")
        print(f"✓ 3 Roles creados")
        print(f"✓ 3 Permisos creados")
        
    except Exception as e:
        session.rollback()
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        session.close()

if __name__ == "__main__":
    main()
