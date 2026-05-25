@echo off
REM Use Python from venv to run the auto-executing migration
"c:\Users\santi\Documents\DIRECTORIO2.0\server\.venv311\Scripts\python.exe" -c "import sys; sys.path.insert(0, r'c:\Users\santi\Documents\DIRECTORIO2.0'); import auto_exec_migrate"
echo.
echo Migration script execution attempt completed.
echo If you see migration messages above, the migration was successful!
pause
