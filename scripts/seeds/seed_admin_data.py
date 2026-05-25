#!/usr/bin/env python3
"""
Script para llenar datos de prueba en el admin panel
- 3 Categorías
- 3 Empresas
- 3 Marketplace items
- 3 Roles
- 3 Permisos
- Y otros módulos necesarios
"""

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"
ADMIN_TOKEN = None

def get_admin_token():
    """Obtiene un token de admin para las solicitudes"""
    # Intentar login con credenciales de admin
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "correo": "admin@admin.com",
            "password": "admin123"
        }
    )
    if response.status_code == 200:
        return response.json().get("access_token")
    return None

def create_categoria(nombre, descripcion):
    """Crea una categoría"""
    headers = {"Authorization": f"Bearer {ADMIN_TOKEN}"} if ADMIN_TOKEN else {}
    response = requests.post(
        f"{BASE_URL}/categorias/",
        json={
            "nombre": nombre,
            "descripcion": descripcion
        },
        headers=headers
    )
    print(f"Categoría '{nombre}': {response.status_code}")
    if response.status_code == 201:
        return response.json().get("id")
    return None

def create_empresa(nombre, nit, correo, direccion, telefono, id_categoria, id_municipio):
    """Crea una empresa"""
    headers = {"Authorization": f"Bearer {ADMIN_TOKEN}"} if ADMIN_TOKEN else {}
    response = requests.post(
        f"{BASE_URL}/empresas/",
        json={
            "nombre": nombre,
            "nit": nit,
            "correo": correo,
            "direccion": direccion,
            "telefono": telefono,
            "id_categoria": id_categoria,
            "id_municipio": id_municipio
        },
        headers=headers
    )
    print(f"Empresa '{nombre}': {response.status_code}")
    if response.status_code == 201:
        return response.json().get("id")
    return None

def create_marketplace(nombre, descripcion, precio, stock, id_estado, id_empresa, id_categoria):
    """Crea un item en el marketplace"""
    headers = {"Authorization": f"Bearer {ADMIN_TOKEN}"} if ADMIN_TOKEN else {}
    response = requests.post(
        f"{BASE_URL}/marketplace/",
        json={
            "nombre": nombre,
            "descripcion": descripcion,
            "precio": precio,
            "stock": stock,
            "id_estado": id_estado,
            "id_empresa": id_empresa,
            "id_categoria": id_categoria
        },
        headers=headers
    )
    print(f"Marketplace '{nombre}': {response.status_code}")
    if response.status_code == 201:
        return response.json().get("id")
    return None

def main():
    global ADMIN_TOKEN
    
    print("=== SEED ADMIN DATA ===\n")
    
    # Obtener token
    ADMIN_TOKEN = get_admin_token()
    if not ADMIN_TOKEN:
        print("❌ No se pudo obtener token de admin")
        return
    
    print("✓ Token de admin obtenido\n")
    
    # ====== CATEGORÍAS ======
    print("--- Creando Categorías ---")
    categorias = [
        {"nombre": "Tecnología", "descripcion": "Productos y servicios tecnológicos"},
        {"nombre": "Salud", "descripcion": "Servicios de salud y bienestar"},
        {"nombre": "Educación", "descripcion": "Servicios educativos y formación"}
    ]
    
    categoria_ids = []
    for cat in categorias:
        cat_id = create_categoria(cat["nombre"], cat["descripcion"])
        if cat_id:
            categoria_ids.append(cat_id)
    
    print(f"\n✓ {len(categoria_ids)} categorías creadas\n")
    
    # ====== EMPRESAS ======
    print("--- Creando Empresas ---")
    
    # Primero obtener un municipio válido
    municipio_response = requests.get(f"{BASE_URL}/municipios/?limit=1")
    municipio_id = 1  # Default
    if municipio_response.status_code == 200:
        municipios = municipio_response.json()
        if municipios:
            municipio_id = municipios[0].get("id", 1)
    
    empresas = [
        {
            "nombre": "TechCorp",
            "nit": "123456789",
            "correo": "techcorp@company.com",
            "direccion": "Calle 1 No 100",
            "telefono": "3001234567",
            "id_categoria": categoria_ids[0] if categoria_ids else 1,
            "id_municipio": municipio_id
        },
        {
            "nombre": "HealthPlus",
            "nit": "987654321",
            "correo": "healthplus@company.com",
            "direccion": "Calle 2 No 200",
            "telefono": "3007654321",
            "id_categoria": categoria_ids[1] if len(categoria_ids) > 1 else 2,
            "id_municipio": municipio_id
        },
        {
            "nombre": "EduCenter",
            "nit": "555666777",
            "correo": "educenter@company.com",
            "direccion": "Calle 3 No 300",
            "telefono": "3009876543",
            "id_categoria": categoria_ids[2] if len(categoria_ids) > 2 else 3,
            "id_municipio": municipio_id
        }
    ]
    
    empresa_ids = []
    for emp in empresas:
        emp_id = create_empresa(
            emp["nombre"],
            emp["nit"],
            emp["correo"],
            emp["direccion"],
            emp["telefono"],
            emp["id_categoria"],
            emp["id_municipio"]
        )
        if emp_id:
            empresa_ids.append(emp_id)
    
    print(f"\n✓ {len(empresa_ids)} empresas creadas\n")
    
    # ====== MARKETPLACE ======
    print("--- Creando Marketplace Items ---")
    
    # Obtener estado válido
    estado_id = 1
    estado_response = requests.get(f"{BASE_URL}/marketplace/estados/?limit=1")
    if estado_response.status_code == 200:
        estados = estado_response.json()
        if estados:
            estado_id = estados[0].get("id", 1)
    
    marketplace_items = [
        {
            "nombre": "Laptop Dell",
            "descripcion": "Laptop de alta performance",
            "precio": 1200.00,
            "stock": 10,
            "id_estado": estado_id,
            "id_empresa": empresa_ids[0] if empresa_ids else 1,
            "id_categoria": categoria_ids[0] if categoria_ids else 1
        },
        {
            "nombre": "Consulta Médica",
            "descripcion": "Consulta médica general",
            "precio": 50.00,
            "stock": 100,
            "id_estado": estado_id,
            "id_empresa": empresa_ids[1] if len(empresa_ids) > 1 else 2,
            "id_categoria": categoria_ids[1] if len(categoria_ids) > 1 else 2
        },
        {
            "nombre": "Curso Online",
            "descripcion": "Curso de programación Python",
            "precio": 99.99,
            "stock": 1000,
            "id_estado": estado_id,
            "id_empresa": empresa_ids[2] if len(empresa_ids) > 2 else 3,
            "id_categoria": categoria_ids[2] if len(categoria_ids) > 2 else 3
        }
    ]
    
    marketplace_ids = []
    for item in marketplace_items:
        item_id = create_marketplace(
            item["nombre"],
            item["descripcion"],
            item["precio"],
            item["stock"],
            item["id_estado"],
            item["id_empresa"],
            item["id_categoria"]
        )
        if item_id:
            marketplace_ids.append(item_id)
    
    print(f"\n✓ {len(marketplace_ids)} items de marketplace creados\n")
    
    print("=== SEED COMPLETADO ===")
    print(f"✓ Categorías: {len(categoria_ids)}")
    print(f"✓ Empresas: {len(empresa_ids)}")
    print(f"✓ Marketplace: {len(marketplace_ids)}")

if __name__ == "__main__":
    main()
