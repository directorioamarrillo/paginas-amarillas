#!/usr/bin/env python3
"""
Direct inline backend migration executor
Performs all migration steps directly
"""
import os
import shutil
import re
from pathlib import Path

os.chdir(r"c:\Users\santi\Documents\DIRECTORIO2.0")

REPO_ROOT = Path(r"c:\Users\santi\Documents\DIRECTORIO2.0")
SERVER_API = REPO_ROOT / "server" / "api"
BACKEND_ROOT = REPO_ROOT / "backend"
BACKEND_APP = BACKEND_ROOT / "app"

print("[1/6] Creating directory structure...")
dirs = [
    BACKEND_ROOT,
    BACKEND_APP,
    BACKEND_ROOT / "migrations",
    BACKEND_ROOT / "tests",
    BACKEND_ROOT / "scripts",
    BACKEND_ROOT / "seeders",
    BACKEND_APP / "repositories"
]

for d in dirs:
    d.mkdir(parents=True, exist_ok=True)
print("  ✓ Directory structure created")

print("\n[2/6] Copying main.py...")
src = SERVER_API / "main.py"
dst = BACKEND_APP / "main.py"
if src.exists():
    shutil.copy2(src, dst)
    print("  ✓ Copied main.py")
else:
    print(f"  ! main.py not found at {src}")

print("\n[3/6] Copying subdirectories...")
dirs_to_copy = ["api", "models", "schemas", "services", "core", "db", "utils", "scheduler"]

for dir_name in dirs_to_copy:
    src = SERVER_API / dir_name
    dst = BACKEND_APP / dir_name
    if src.exists() and src.is_dir():
        if dst.exists():
            shutil.rmtree(dst)
        shutil.copytree(src, dst)
        print(f"  ✓ Copied {dir_name}")
    else:
        print(f"  ! {dir_name} not found at {src}")

print("\n[4/6] Copying configuration directories...")
dirs_mapping = [
    ("server/alembic", "migrations"),
    ("server/tests", "tests"),
    ("server/scripts", "scripts"),
    ("server/seeders", "seeders"),
]

for src_rel, dst_name in dirs_mapping:
    src = REPO_ROOT / src_rel
    dst = BACKEND_ROOT / dst_name
    if src.exists() and src.is_dir():
        if dst.exists():
            shutil.rmtree(dst)
        shutil.copytree(src, dst)
        print(f"  ✓ Copied {src_rel} -> {dst_name}")
    else:
        print(f"  ! {src_rel} not found")

print("\n[5/6] Copying configuration files...")
files_to_copy = {
    "requirements.txt": "requirements.txt",
    "requirements-extras.txt": "requirements-extras.txt",
    "Dockerfile": "Dockerfile",
    ".env.example": ".env.example",
    ".gitignore": ".gitignore",
    "alembic.ini": "alembic.ini",
}

for src_name, dst_name in files_to_copy.items():
    src = REPO_ROOT / "server" / src_name
    dst = BACKEND_ROOT / dst_name
    if src.exists():
        shutil.copy2(src, dst)
        print(f"  ✓ Copied {src_name}")
    else:
        print(f"  ! {src_name} not found")

print("\n[6/6] Fixing imports and creating __init__.py files...")

IMPORT_PATTERN = r'\bfrom\s+api(\.|/)'
IMPORT_REPLACEMENT = r'from app\1'

fixed_count = 0
init_count = 0

for item in BACKEND_ROOT.rglob("*"):
    if item.is_dir() and "__pycache__" not in str(item):
        init_path = item / "__init__.py"
        if not init_path.exists():
            init_path.write_text("")
            init_count += 1
    
    if item.is_file() and item.suffix == ".py" and "__pycache__" not in str(item):
        try:
            content = item.read_text(encoding='utf-8')
            if "from api." in content or "from api/" in content:
                new_content = re.sub(IMPORT_PATTERN, IMPORT_REPLACEMENT, content)
                if new_content != content:
                    item.write_text(new_content, encoding='utf-8')
                    fixed_count += 1
        except Exception as e:
            print(f"  ! Error with {item}: {e}")

print(f"  ✓ Fixed imports in {fixed_count} files")
print(f"  ✓ Created {init_count} __init__.py files")

print("\n" + "=" * 70)
print("MIGRATION COMPLETED SUCCESSFULLY!")
print("=" * 70)
print(f"\n✓ Backend structure created at: {BACKEND_ROOT}")
print(f"✓ Main application code at: {BACKEND_APP}")
print(f"✓ Total files with fixed imports: {fixed_count}")
print(f"✓ Total __init__.py files created: {init_count}")
print("\nDirectory structure:")
for item in sorted(BACKEND_ROOT.iterdir()):
    print(f"  - {item.name}/")
