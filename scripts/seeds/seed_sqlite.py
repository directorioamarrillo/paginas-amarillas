#!/usr/bin/env python3
"""
Script para llenar datos de prueba en SQLite directamente
"""

import sqlite3
import os
from datetime import datetime

DB_PATH = "test.db"

def connect_db():
    """Conecta a la base de datos SQLite"""
    if not os.path.exists(DB_PATH):
        print(f"❌ Base de datos no encontrada en {DB_PATH}")
        return None
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def insert_categoria(conn, nombre, descripcion):
    """Inserta una categoría"""
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO categorias (nombre, descripcion)
            VALUES (?, ?)
        """, (nombre, descripcion))
        conn.commit()
        print(f"  ✓ Categoría '{nombre}' creada")
        return cursor.lastrowid
    except sqlite3.IntegrityError as e:
        print(f"  ⚠ Error al crear categoría '{nombre}': {e}")
        return None

def insert_empresa(conn, nombre, nit, correo, direccion, telefono, id_categoria, id_municipio):
    """Inserta una empresa"""
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO empresas (nombre, nit, correo, direccion, telefono, id_categoria, id_municipio, id_usuario_creador, fecha_creacion)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (nombre, nit, correo, direccion, telefono, id_categoria, id_municipio, 1, datetime.now()))
        conn.commit()
        print(f"  ✓ Empresa '{nombre}' creada")
        return cursor.lastrowid
    except sqlite3.IntegrityError as e:
        print(f"  ⚠ Error al crear empresa '{nombre}': {e}")
        return None

def insert_marketplace(conn, nombre, descripcion, precio, stock, id_estado, id_empresa, id_categoria):
    """Inserta un item en marketplace"""
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO marketplace (nombre, descripcion, precio, stock, id_estado, id_empresa, id_categoria, fecha_publicacion)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (nombre, descripcion, precio, stock, id_estado, id_empresa, id_categoria, datetime.now()))
        conn.commit()
        print(f"  ✓ Marketplace '{nombre}' creado")
        return cursor.lastrowid
    except sqlite3.IntegrityError as e:
        print(f"  ⚠ Error al crear marketplace '{nombre}': {e}")
        return None

def insert_rol(conn, nombre, descripcion):
    """Inserta un rol"""
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO roles (nombre, descripcion)
            VALUES (?, ?)
        """, (nombre, descripcion))
        conn.commit()
        print(f"  ✓ Rol '{nombre}' creado")
        return cursor.lastrowid
    except sqlite3.IntegrityError as e:
        print(f"  ⚠ Error al crear rol '{nombre}': {e}")
        return None

def insert_permiso(conn, key, descripcion):
    """Inserta un permiso"""
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO permisos (key, descripcion)
            VALUES (?, ?)
        """, (key, descripcion))
        conn.commit()
        print(f"  ✓ Permiso '{key}' creado")
        return cursor.lastrowid
    except sqlite3.IntegrityError as e:
        print(f"  ⚠ Error al crear permiso '{key}': {e}")
        return None

def get_municipio_sample(conn):
    """Obtiene un municipio válido para usar en empresas"""
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM municipios LIMIT 1")
    row = cursor.fetchone()
    if row:
        return row[0]
    
    # Si no hay municipios, crear uno
    cursor.execute("INSERT INTO departamentos (nombre) VALUES (?)", ("Bogotá",))
    dep_id = cursor.lastrowid
    cursor.execute("INSERT INTO municipios (nombre, id_departamento) VALUES (?, ?)", ("Bogotá", dep_id))
    conn.commit()
    return cursor.lastrowid

def get_estado_sample(conn):
    """Obtiene un estado válido para marketplace"""
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM estados_marketplace LIMIT 1")
    row = cursor.fetchone()
    if row:
        return row[0]
    
    # Si no hay estados, crear uno
    cursor.execute("INSERT INTO estados_marketplace (nombre, descripcion) VALUES (?, ?)", ("Activo", "Producto activo"))
    conn.commit()
    return cursor.lastrowid

def main():
    print("=== SEED ADMIN DATA (SQLITE) ===\n")
    
    conn = connect_db()
    if not conn:
        return
    
    # Obtener referencias válidas
    municipio_id = get_municipio_sample(conn)
    estado_id = get_estado_sample(conn)
    print(f"✓ Municipio ID: {municipio_id}\n")
    print(f"✓ Estado ID: {estado_id}\n")
    
    # ====== CATEGORÍAS ======
    print("--- Creando Categorías ---")
    categorias = [
        ("Tecnología", "Productos y servicios tecnológicos"),
        ("Salud", "Servicios de salud y bienestar"),
        ("Educación", "Servicios educativos y formación")
    ]
    
    categoria_ids = []
    for nombre, desc in categorias:
        cat_id = insert_categoria(conn, nombre, desc)
        if cat_id:
            categoria_ids.append(cat_id)
    
    print(f"✓ {len(categoria_ids)} categorías creadas\n")
    
    # ====== EMPRESAS ======
    print("--- Creando Empresas ---")
    empresas = [
        ("TechCorp", "123456789", "techcorp@company.com", "Calle 1 No 100", "3001234567", categoria_ids[0] if categoria_ids else 1),
        ("HealthPlus", "987654321", "healthplus@company.com", "Calle 2 No 200", "3007654321", categoria_ids[1] if len(categoria_ids) > 1 else 1),
        ("EduCenter", "555666777", "educenter@company.com", "Calle 3 No 300", "3009876543", categoria_ids[2] if len(categoria_ids) > 2 else 1)
    ]
    
    empresa_ids = []
    for nombre, nit, correo, direccion, telefono, id_cat in empresas:
        emp_id = insert_empresa(conn, nombre, nit, correo, direccion, telefono, id_cat, municipio_id)
        if emp_id:
            empresa_ids.append(emp_id)
    
    print(f"✓ {len(empresa_ids)} empresas creadas\n")
    
    # ====== MARKETPLACE ======
    print("--- Creando Marketplace Items ---")
    marketplace_items = [
        ("Laptop Dell", "Laptop de alta performance", 1200.00, 10, empresa_ids[0] if empresa_ids else 1, categoria_ids[0] if categoria_ids else 1),
        ("Consulta Médica", "Consulta médica general", 50.00, 100, empresa_ids[1] if len(empresa_ids) > 1 else 1, categoria_ids[1] if len(categoria_ids) > 1 else 1),
        ("Curso Online", "Curso de programación Python", 99.99, 1000, empresa_ids[2] if len(empresa_ids) > 2 else 1, categoria_ids[2] if len(categoria_ids) > 2 else 1)
    ]
    
    marketplace_ids = []
    for nombre, desc, precio, stock, id_emp, id_cat in marketplace_items:
        item_id = insert_marketplace(conn, nombre, desc, precio, stock, estado_id, id_emp, id_cat)
        if item_id:
            marketplace_ids.append(item_id)
    
    print(f"✓ {len(marketplace_ids)} items de marketplace creados\n")
    
    # ====== ROLES ======
    print("--- Creando Roles ---")
    roles = [
        ("Administrador", "Usuario con acceso total"),
        ("Vendedor", "Usuario que puede vender productos"),
        ("Cliente", "Usuario cliente regular")
    ]
    
    rol_ids = []
    for nombre, desc in roles:
        rol_id = insert_rol(conn, nombre, desc)
        if rol_id:
            rol_ids.append(rol_id)
    
    print(f"✓ {len(rol_ids)} roles creados\n")
    
    # ====== PERMISOS ======
    print("--- Creando Permisos ---")
    permisos = [
        ("CREAR_EMPRESA", "Permiso para crear empresas"),
        ("MODIFICAR_EMPRESA", "Permiso para modificar empresas"),
        ("ELIMINAR_EMPRESA", "Permiso para eliminar empresas")
    ]
    
    permiso_ids = []
    for key, desc in permisos:
        perm_id = insert_permiso(conn, key, desc)
        if perm_id:
            permiso_ids.append(perm_id)
    
    print(f"✓ {len(permiso_ids)} permisos creados\n")
    
    conn.close()
    
    print("=== SEED COMPLETADO ===")
    print(f"✓ Categorías: {len(categoria_ids)}")
    print(f"✓ Empresas: {len(empresa_ids)}")
    print(f"✓ Marketplace: {len(marketplace_ids)}")
    print(f"✓ Roles: {len(rol_ids)}")
    print(f"✓ Permisos: {len(permiso_ids)}")

if __name__ == "__main__":
    main()
