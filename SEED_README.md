# Script de Seed - Datos de Prueba

Este directorio contiene scripts para llenar la base de datos con datos de prueba para el panel de administración.

## Contenido Agregado

El seed agrega:

1. **3 Categorías**
   - Tecnología
   - Salud
   - Educación

2. **3 Empresas**
   - TechCorp
   - HealthPlus
   - EduCenter

3. **3 Items de Marketplace**
   - Laptop Dell ($1200)
   - Consulta Médica ($50)
   - Curso Online ($99.99)

4. **3 Roles**
   - Administrador
   - Vendedor
   - Cliente

5. **3 Permisos**
   - CREAR_EMPRESA
   - MODIFICAR_EMPRESA
   - ELIMINAR_EMPRESA

## Cómo Usar

### ✅ OPCIÓN 1: Script .bat (MÁS FÁCIL - Windows)
```bash
install_and_seed.bat
```
Esto instala automáticamente `psycopg2` y ejecuta el seed. **¡Recomendado!**

### ✅ OPCIÓN 2: Script Python Simple
```bash
python seed_easy.py
```
Ejecutar desde el directorio raíz del proyecto. Instala psycopg2 automáticamente si falta.

### Opción 3: Script Python Completo
```bash
python seed_sync_postgres.py
```

### Opción 4: Manual (no recomendado)
```bash
# Primero instalar dependencias
pip install psycopg2-binary

# Luego ejecutar
cd backend
python -m seeders.seed_test_data
```

## Requisitos

- Python 3.8+
- SQLAlchemy 2.0+
- Dependencias de `backend/requirements.txt`
- Para PostgreSQL: `psycopg2-binary` o `asyncpg`

## Instalación de Dependencias

```bash
cd backend
pip install -r requirements.txt
pip install psycopg2-binary
```

## Notas

- El script verifica si ya existen categorías. Si las hay, no crea duplicados.
- Los datos se crean en la base de datos especificada en `.env`
- Compatible con PostgreSQL y SQLite
- El usuario admin se crea con credenciales:
  - Email: `admin@admin.com`
  - Password: `admin123`

## Problemas Comunes

### Error: "ModuleNotFoundError: No module named 'psycopg2'"
Ejecuta: `pip install psycopg2-binary`

### Error: "No module named 'app'"
Asegúrate de ejecutar desde el directorio raíz del proyecto

### Error: "Database URL not valid"
Verifica que la variable `SQLALCHEMY_DATABASE_URL` esté configurada en `.env`

### Error: "Datos ya existen"
Es seguro - el script detecta si los datos ya existen y no crea duplicados.
Para limpiar y empezar de nuevo, vacía las tablas manualmente:
```sql
DELETE FROM marketplaces;
DELETE FROM empresas;
DELETE FROM categorias;
DELETE FROM roles;
DELETE FROM permisos;
```
