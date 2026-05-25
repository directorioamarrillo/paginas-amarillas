@echo off
setlocal enabledelayedexpansion

REM Use the Python from .venv311
set PYTHON_EXE=c:\Users\santi\Documents\DIRECTORIO2.0\server\.venv311\Scripts\python.exe

cd /d "c:\Users\santi\Documents\DIRECTORIO2.0"

REM Run the migration with the Python from venv
"%PYTHON_EXE%" final_migration.py

pause
