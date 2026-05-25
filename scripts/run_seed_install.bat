@echo off
REM Script para instalar dependencias y ejecutar el seed

echo Instalando dependencias PostgreSQL...
pip install psycopg2-binary asyncpg -q

if %ERRORLEVEL% NEQ 0 (
    echo Error al instalar dependencias
    exit /b 1
)

echo.
echo Ejecutando seed de datos...
cd backend
python -m seeders.seed_test_data

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ Seed completado exitosamente
) else (
    echo.
    echo ✗ Error en el seed
    exit /b 1
)
