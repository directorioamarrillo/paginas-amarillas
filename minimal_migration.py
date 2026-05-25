#!/usr/bin/env python3
"""
Minimal migration module - can be imported or run
"""
import os
os.chdir(r"c:\Users\santi\Documents\DIRECTORIO2.0")

# Execute the migration inline
import shutil
import re
from pathlib import Path

REPO_ROOT = Path(r"c:\Users\santi\Documents\DIRECTORIO2.0")
SERVER_API = REPO_ROOT / "server" / "api"
BACKEND_ROOT = REPO_ROOT / "backend"
BACKEND_APP = BACKEND_ROOT / "app"

# Create directories
for d in [BACKEND_ROOT, BACKEND_APP, BACKEND_ROOT / "migrations", BACKEND_ROOT / "tests", BACKEND_ROOT / "scripts", BACKEND_ROOT / "seeders", BACKEND_APP / "repositories"]:
    d.mkdir(parents=True, exist_ok=True)

# Copy main.py
shutil.copy2(SERVER_API / "main.py", BACKEND_APP / "main.py")

# Copy subdirectories
for dir_name in ["api", "models", "schemas", "services", "core", "db", "utils", "scheduler"]:
    src = SERVER_API / dir_name
    dst = BACKEND_APP / dir_name
    if src.exists():
        if dst.exists():
            shutil.rmtree(dst)
        shutil.copytree(src, dst)

# Copy other directories
for src_rel, dst_name in [("server/alembic", "migrations"), ("server/tests", "tests"), ("server/scripts", "scripts"), ("server/seeders", "seeders")]:
    src = REPO_ROOT / src_rel
    dst = BACKEND_ROOT / dst_name
    if src.exists():
        if dst.exists():
            shutil.rmtree(dst)
        shutil.copytree(src, dst)

# Copy files
for src_name, dst_name in [("requirements.txt", "requirements.txt"), ("requirements-extras.txt", "requirements-extras.txt"), ("Dockerfile", "Dockerfile"), (".env.example", ".env.example"), (".gitignore", ".gitignore"), ("alembic.ini", "alembic.ini")]:
    src = REPO_ROOT / "server" / src_name
    dst = BACKEND_ROOT / dst_name
    if src.exists():
        shutil.copy2(src, dst)

# Fix imports
IMPORT_PATTERN = r'\bfrom\s+api(\.|/)'
IMPORT_REPLACEMENT = r'from app\1'
fixed = 0

for item in BACKEND_ROOT.rglob("*"):
    if item.is_dir() and "__pycache__" not in str(item):
        (item / "__init__.py").touch()
    if item.is_file() and item.suffix == ".py" and "__pycache__" not in str(item):
        try:
            c = item.read_text(encoding='utf-8')
            if "from api." in c or "from api/" in c:
                n = re.sub(IMPORT_PATTERN, IMPORT_REPLACEMENT, c)
                if n != c:
                    item.write_text(n, encoding='utf-8')
                    fixed += 1
        except:
            pass

print(f"Migration complete! Fixed {fixed} files")
