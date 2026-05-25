@echo off
cd C:\Users\santi\Documents\DIRECTORIO2.0

echo.
echo ========================================
echo Instalando psycopg2-binary...
echo ========================================
pip install psycopg2-binary

echo.
echo ========================================
echo Ejecutando seed de datos...
echo ========================================
python seed_easy.py

echo.
echo ========================================
echo Finalizado
echo ========================================
