#!/usr/bin/env python3
import os
import shutil
import re
import sys
from pathlib import Path

# Set working directory
os.chdir(r"c:\Users\santi\Documents\DIRECTORIO2.0")

REPO_ROOT = Path(r"c:\Users\santi\Documents\DIRECTORIO2.0")
SERVER_API = REPO_ROOT / "server" / "api"
BACKEND_ROOT = REPO_ROOT / "backend"
BACKEND_APP = BACKEND_ROOT / "app"

def main():
    print("[INFO] Starting backend migration...")
    
    # Step 1: Create directory structure
    print("\n[INFO] Step 1: Creating directory structure")
    dirs = [
        BACKEND_ROOT,
        BACKEND_APP,
        BACKEND_ROOT / "migrations",
        BACKEND_ROOT / "tests",
        BACKEND_ROOT / "scripts",
        BACKEND_ROOT / "seeders",
        BACKEND_APP / "repositories"
    ]
    
    for dir_path in dirs:
        dir_path.mkdir(parents=True, exist_ok=True)
        print(f"  ✓ Created: {dir_path}")
    
    # Step 2: Copy main.py
    print("\n[INFO] Step 2: Copying main.py")
    src = SERVER_API / "main.py"
    dst = BACKEND_APP / "main.py"
    if src.exists():
        shutil.copy2(src, dst)
        print(f"  ✓ Copied: main.py")
    
    # Step 3: Copy subdirectories from server/api
    print("\n[INFO] Step 3: Copying directories from server/api")
    dirs_to_copy = ["api", "models", "schemas", "services", "core", "db", "utils", "scheduler"]
    
    for dir_name in dirs_to_copy:
        src = SERVER_API / dir_name
        dst = BACKEND_APP / dir_name
        if src.exists() and src.is_dir():
            if dst.exists():
                shutil.rmtree(dst)
            shutil.copytree(src, dst)
            print(f"  ✓ Copied: {dir_name}")
    
    # Step 4: Copy alembic, tests, scripts, seeders
    print("\n[INFO] Step 4: Copying configuration directories")
    
    src = REPO_ROOT / "server" / "alembic"
    dst = BACKEND_ROOT / "migrations"
    if src.exists():
        if dst.exists():
            shutil.rmtree(dst)
        shutil.copytree(src, dst)
        print(f"  ✓ Copied: alembic -> migrations")
    
    src = REPO_ROOT / "server" / "tests"
    dst = BACKEND_ROOT / "tests"
    if src.exists():
        if dst.exists():
            shutil.rmtree(dst)
        shutil.copytree(src, dst)
        print(f"  ✓ Copied: tests")
    
    src = REPO_ROOT / "server" / "scripts"
    dst = BACKEND_ROOT / "scripts"
    if src.exists():
        if dst.exists():
            shutil.rmtree(dst)
        shutil.copytree(src, dst)
        print(f"  ✓ Copied: scripts")
    
    src = REPO_ROOT / "server" / "seeders"
    dst = BACKEND_ROOT / "seeders"
    if src.exists():
        if dst.exists():
            shutil.rmtree(dst)
        shutil.copytree(src, dst)
        print(f"  ✓ Copied: seeders")
    
    # Step 5: Copy configuration files
    print("\n[INFO] Step 5: Copying configuration files")
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
            print(f"  ✓ Copied: {src_name}")
    
    # Step 6: Fix imports
    print("\n[INFO] Step 6: Fixing imports in Python files")
    IMPORT_PATTERN = r'\bfrom\s+api(\.|/)'
    IMPORT_REPLACEMENT = r'from app\1'
    
    fixed_count = 0
    for py_file in BACKEND_ROOT.rglob("*.py"):
        if "__pycache__" in str(py_file):
            continue
        
        try:
            content = py_file.read_text(encoding='utf-8')
            if "from api." in content or "from api/" in content:
                new_content = re.sub(IMPORT_PATTERN, IMPORT_REPLACEMENT, content)
                if new_content != content:
                    py_file.write_text(new_content, encoding='utf-8')
                    fixed_count += 1
                    print(f"  ✓ Fixed imports: {py_file.relative_to(BACKEND_ROOT)}")
        except Exception as e:
            print(f"  ! Error processing {py_file}: {e}")
    
    print(f"  Total files with fixed imports: {fixed_count}")
    
    # Step 7: Create __init__.py files
    print("\n[INFO] Step 7: Creating __init__.py files")
    init_count = 0
    for py_file in BACKEND_ROOT.rglob("*"):
        if py_file.is_dir() and "__pycache__" not in str(py_file):
            init_path = py_file / "__init__.py"
            if not init_path.exists():
                init_path.write_text("")
                init_count += 1
    
    print(f"  Created {init_count} __init__.py files")
    
    # Step 8: Summary
    print("\n" + "=" * 60)
    print("MIGRATION COMPLETED SUCCESSFULLY!")
    print("=" * 60)
    print(f"\nBackend structure created at: {BACKEND_ROOT}")
    print(f"Main application code at: {BACKEND_APP}")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
