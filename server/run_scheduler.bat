@echo off
title Planificador de Backups - Directorio 2.0
cd %~dp0
venv\Scripts\python.exe api/scheduler/backup_scheduler.py --run-once
