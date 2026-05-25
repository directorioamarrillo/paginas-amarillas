@echo off
REM Script para ejecutar el seed de datos de prueba

cd backend

echo Ejecutando seed de datos de prueba...
python -m seeders.seed_test_data

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ Seed completado exitosamente
) else (
    echo.
    echo ✗ Error en el seed
    exit /b 1
)
