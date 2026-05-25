@echo off
setlocal enabledelayedexpansion
cd /d "c:\Users\santi\Documents\DIRECTORIO2.0"

REM Create directories
mkdir backend\app
mkdir backend\migrations
mkdir backend\tests
mkdir backend\scripts
mkdir backend\seeders
mkdir backend\app\repositories

REM Copy directories using xcopy (recursive)
echo Copying api directory...
xcopy "server\api\api" "backend\app\api" /Y /I /S

echo Copying models directory...
xcopy "server\api\models" "backend\app\models" /Y /I /S

echo Copying schemas directory...
xcopy "server\api\schemas" "backend\app\schemas" /Y /I /S

echo Copying services directory...
xcopy "server\api\services" "backend\app\services" /Y /I /S

echo Copying core directory...
xcopy "server\api\core" "backend\app\core" /Y /I /S

echo Copying db directory...
xcopy "server\api\db" "backend\app\db" /Y /I /S

echo Copying utils directory...
xcopy "server\api\utils" "backend\app\utils" /Y /I /S

echo Copying scheduler directory...
xcopy "server\api\scheduler" "backend\app\scheduler" /Y /I /S

echo Copying main.py...
copy "server\api\main.py" "backend\app\main.py"

echo Copying alembic -> migrations...
xcopy "server\alembic" "backend\migrations" /Y /I /S

echo Copying tests...
xcopy "server\tests" "backend\tests" /Y /I /S

echo Copying scripts...
xcopy "server\scripts" "backend\scripts" /Y /I /S

echo Copying seeders...
xcopy "server\seeders" "backend\seeders" /Y /I /S

echo Copying configuration files...
copy "server\requirements.txt" "backend\"
copy "server\requirements-extras.txt" "backend\"
copy "server\Dockerfile" "backend\"
copy "server\.env.example" "backend\"
copy "server\.gitignore" "backend\"
copy "server\alembic.ini" "backend\"

REM Now run Python to fix imports
echo.
echo Fixing imports...
python final_migration.py

echo.
echo Migration completed!
pause
