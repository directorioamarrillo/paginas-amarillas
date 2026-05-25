@echo off
REM Script simple para instalar psycopg2 y ejecutar el seed

echo Instalando psycopg2-binary...
pip install psycopg2-binary --quiet

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Error instalando psycopg2-binary. Intentando alternativa...
    pip install psycopg2
    if %ERRORLEVEL% NEQ 0 (
        echo Fallo al instalar driver PostgreSQL
        pause
        exit /b 1
    )
)

echo.
echo ✓ Driver PostgreSQL instalado
echo.
echo Ejecutando seed...
python seed_easy.py

pause
