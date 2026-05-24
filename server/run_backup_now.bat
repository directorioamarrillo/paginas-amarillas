@echo off
title Forzar Backup - Directorio 2.0
cd %~dp0
echo Iniciando proceso de copia de seguridad forzada...
venv\Scripts\python.exe api/scheduler/backup_scheduler.py --run-once --force
echo.
echo Proceso finalizado.
pause
