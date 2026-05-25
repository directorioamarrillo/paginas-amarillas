#!/usr/bin/env python3
import os
import sys
import shutil
import re
from pathlib import Path

os.chdir(r'c:\Users\santi\Documents\DIRECTORIO2.0')
REPO_ROOT = Path(r"c:\Users\santi\Documents\DIRECTORIO2.0")
SERVER_API = REPO_ROOT / "server" / "api"
BACKEND_ROOT = REPO_ROOT / "backend"
BACKEND_APP = BACKEND_ROOT / "app"

print("[INFO] Starting backend migration...")

# Create directories
BACKEND_ROOT.mkdir(parents=True, exist_ok=True)
BACKEND_APP.mkdir(parents=True, exist_ok=True)
(BACKEND_ROOT / "migrations").mkdir(parents=True, exist_ok=True)
(BACKEND_ROOT / "tests").mkdir(parents=True, exist_ok=True)
(BACKEND_ROOT / "scripts").mkdir(parents=True, exist_ok=True)
(BACKEND_ROOT / "seeders").mkdir(parents=True, exist_ok=True)
(BACKEND_APP / "repositories").mkdir(parents=True, exist_ok=True)

print("[INFO] Directory structure created")

# Copy directories
mappings = [
    (SERVER_API / "main.py", BACKEND_APP / "main.py"),
    (SERVER_API / "api", BACKEND_APP / "api"),
    (SERVER_API / "models", BACKEND_APP / "models"),
    (SERVER_API / "schemas", BACKEND_APP / "schemas"),
    (SERVER_API / "services", BACKEND_APP / "services"),
    (SERVER_API / "core", BACKEND_APP / "core"),
    (SERVER_API / "db", BACKEND_APP / "db"),
    (SERVER_API / "utils", BACKEND_APP / "utils"),
    (SERVER_API / "scheduler", BACKEND_APP / "scheduler"),
    (REPO_ROOT / "server" / "alembic", BACKEND_ROOT / "migrations"),
    (REPO_ROOT / "server" / "tests", BACKEND_ROOT / "tests"),
    (REPO_ROOT / "server" / "scripts", BACKEND_ROOT / "scripts"),
    (REPO_ROOT / "server" / "seeders", BACKEND_ROOT / "seeders"),
]

for src, dst in mappings:
    try:
        if src.is_file():
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dst)
            print(f"[OK] Copied file: {src.name}")
        elif src.is_dir():
            if dst.exists():
                shutil.rmtree(dst)
            shutil.copytree(src, dst)
            print(f"[OK] Copied dir: {src.name}")
    except Exception as e:
        print(f"[ERROR] {src.name}: {e}")

# Copy config files
file_copies = [
    (REPO_ROOT / "server" / "requirements.txt", BACKEND_ROOT / "requirements.txt"),
    (REPO_ROOT / "server" / "requirements-extras.txt", BACKEND_ROOT / "requirements-extras.txt"),
    (REPO_ROOT / "server" / "Dockerfile", BACKEND_ROOT / "Dockerfile"),
    (REPO_ROOT / "server" / ".env.example", BACKEND_ROOT / ".env.example"),
    (REPO_ROOT / "server" / ".gitignore", BACKEND_ROOT / ".gitignore"),
    (REPO_ROOT / "server" / "alembic.ini", BACKEND_ROOT / "alembic.ini"),
]

for src, dst in file_copies:
    try:
        if src.exists():
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dst)
            print(f"[OK] Copied config: {src.name}")
    except Exception as e:
        print(f"[WARN] {src.name}: {e}")

# Fix imports
print("\n[INFO] Fixing imports...")
IMPORT_PATTERN = r'\bfrom\s+api(\.|/)'
IMPORT_REPLACEMENT = r'from app\1'
fixed_count = 0

for py_file in BACKEND_APP.rglob("*.py"):
    if "__pycache__" in str(py_file):
        continue
    try:
        content = py_file.read_text(encoding='utf-8')
        if "from api." in content or "from api/" in content:
            new_content = re.sub(IMPORT_PATTERN, IMPORT_REPLACEMENT, content)
            if new_content != content:
                py_file.write_text(new_content, encoding='utf-8')
                fixed_count += 1
    except Exception as e:
        pass

print(f"[OK] Fixed imports in {fixed_count} files")

# Create __init__.py files
for root, dirs, files in os.walk(BACKEND_APP):
    if "__init__.py" not in files:
        init_file = Path(root) / "__init__.py"
        init_file.write_text("")

print("\n[INFO] ✓ Backend migration completed successfully!")
print(f"[INFO] Backend location: {BACKEND_ROOT}")

if __name__ == "__main__":
    pass
