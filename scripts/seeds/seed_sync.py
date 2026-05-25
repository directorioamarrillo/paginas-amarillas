#!/usr/bin/env python3
"""
Script para llenar datos de prueba - versión síncrona con SQLAlchemy
Ejecutar: python seed_sync.py
"""

import sys
from pathlib import Path

# Agregar el backend al path
sys.path.insert(0, str(Path(__file__).parent / "backend"))

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from datetime import datetime

from app.models.models import (
    Categoria, Empresa, Marketplace, Rol, Permiso, 
    Departamento, Municipio, EstadoMarketplace, Usuario, Pais
)
from app.db.conexion import Base
from app.api.auth import hash_password

# Para SQLite
DATABASE_URL = "sqlite:///./test.db"

def main():
    print("=== SEED ADMIN DATA (Sync SQLAlchemy) ===\n")
    
    engine = create_engine(DATABASE_URL, echo=False)
    Base.metadata.create_all(engine)
    
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Verificar si hay datos ya
        categorias_existentes = session.query(Categoria).all()
        if categorias_existentes:
            print("⚠ Las categorías ya existen. Abortando para no duplicar datos.")
            session.close()
            return
        
        # ====== PAÍS ======
        pais = Pais(nombre="Colombia", codigo_iso="CO")
        session.add(pais)
        session.flush()
        print("✓ País creado\n")
        
        # ====== DEPARTAMENTO Y MUNICIPIO ======
        print("--- Creando Geográfica ---")
        departamento = Departamento(nombre="Bogotá D.C.", id_pais=pais.id)
        session.add(departamento)
        session.flush()
        
        municipio = Municipio(nombre="Bogotá", id_departamento=departamento.id)
        session.add(municipio)
        session.flush()
        print(f"✓ Departamento y Municipio creados\n")
        
        # ====== CATEGORÍAS ======
        print("--- Creando Categorías ---")
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
            print(f"  ✓ Categoría '{nombre}' creada")
        
        session.flush()
        print()
        
        # ====== ESTADO MARKETPLACE ======
        print("--- Creando Estados de Marketplace ---")
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
            print(f"  ✓ Estado '{nombre}' creado")
        
        session.flush()
        print()
        
        # ====== USUARIO CREADOR ======
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
        print("--- Creando Empresas ---")
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
            print(f"  ✓ Empresa '{nombre}' creada")
        
        session.flush()
        print()
        
        # ====== MARKETPLACE ======
        print("--- Creando Marketplace Items ---")
        marketplace_data = [
            ("Laptop Dell", "Laptop de alta performance", 1200.00, 10, 0, 0),
            ("Consulta Médica", "Consulta médica general", 50.00, 100, 1, 1),
            ("Curso Online", "Curso de programación Python", 99.99, 1000, 2, 2)
        ]
        
        marketplaces = []
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
            marketplaces.append(market)
            print(f"  ✓ Marketplace '{nombre}' creado")
        
        session.flush()
        print()
        
        # ====== ROLES ======
        print("--- Creando Roles ---")
        roles_data = [
            ("Administrador", "Usuario con acceso total"),
            ("Vendedor", "Usuario que puede vender productos"),
            ("Cliente", "Usuario cliente regular")
        ]
        
        roles = []
        for nombre, desc in roles_data:
            rol = Rol(nombre=nombre, descripcion=desc)
            session.add(rol)
            roles.append(rol)
            print(f"  ✓ Rol '{nombre}' creado")
        
        session.flush()
        print()
        
        # ====== PERMISOS ======
        print("--- Creando Permisos ---")
        permisos_data = [
            ("CREAR_EMPRESA", "Permiso para crear empresas"),
            ("MODIFICAR_EMPRESA", "Permiso para modificar empresas"),
            ("ELIMINAR_EMPRESA", "Permiso para eliminar empresas")
        ]
        
        permisos = []
        for key, desc in permisos_data:
            perm = Permiso(key=key, descripcion=desc)
            session.add(perm)
            permisos.append(perm)
            print(f"  ✓ Permiso '{key}' creado")
        
        session.flush()
        print()
        
        # Commit final
        session.commit()
        
        print("=== SEED COMPLETADO EXITOSAMENTE ===")
        print(f"✓ Categorías: {len(categorias_data)}")
        print(f"✓ Empresas: {len(empresas_data)}")
        print(f"✓ Marketplace: {len(marketplace_data)}")
        print(f"✓ Roles: {len(roles_data)}")
        print(f"✓ Permisos: {len(permisos_data)}")
        
    except Exception as e:
        session.rollback()
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        session.close()

if __name__ == "__main__":
    main()
