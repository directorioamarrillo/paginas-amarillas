#!/usr/bin/env python3
"""
Manual Backend Migration Execution
Reorganize from server/api/ to backend/app/
"""
import os
import shutil
import re
from pathlib import Path
from typing import List, Tuple, Dict

# Base paths
REPO_ROOT = Path(r"c:\Users\santi\Documents\DIRECTORIO2.0")
SERVER_API = REPO_ROOT / "server" / "api"
BACKEND_ROOT = REPO_ROOT / "backend"
BACKEND_APP = BACKEND_ROOT / "app"

# Mapping of source to destination directories
COPY_MAPPINGS = {
    SERVER_API / "main.py": BACKEND_APP / "main.py",
    SERVER_API / "api": BACKEND_APP / "api",
    SERVER_API / "models": BACKEND_APP / "models",
    SERVER_API / "schemas": BACKEND_APP / "schemas",
    SERVER_API / "services": BACKEND_APP / "services",
    SERVER_API / "core": BACKEND_APP / "core",
    SERVER_API / "db": BACKEND_APP / "db",
    SERVER_API / "utils": BACKEND_APP / "utils",
    SERVER_API / "scheduler": BACKEND_APP / "scheduler",
    REPO_ROOT / "server" / "alembic": BACKEND_ROOT / "migrations",
    REPO_ROOT / "server" / "tests": BACKEND_ROOT / "tests",
    REPO_ROOT / "server" / "scripts": BACKEND_ROOT / "scripts",
    REPO_ROOT / "server" / "seeders": BACKEND_ROOT / "seeders",
}

# File-level copies (not directories)
FILE_COPIES = {
    REPO_ROOT / "server" / "requirements.txt": BACKEND_ROOT / "requirements.txt",
    REPO_ROOT / "server" / "requirements-extras.txt": BACKEND_ROOT / "requirements-extras.txt",
    REPO_ROOT / "server" / "Dockerfile": BACKEND_ROOT / "Dockerfile",
    REPO_ROOT / "server" / ".env.example": BACKEND_ROOT / ".env.example",
    REPO_ROOT / "server" / ".gitignore": BACKEND_ROOT / ".gitignore",
    REPO_ROOT / "server" / "alembic.ini": BACKEND_ROOT / "alembic.ini",
}

# Python files that need import replacement
IMPORT_PATTERN = r'\bfrom\s+api(\.|/)'
IMPORT_REPLACEMENT = r'from app\1'

def log(msg: str, level="INFO"):
    """Simple logging"""
    print(f"[{level}] {msg}")

def create_init_file(path: Path):
    """Create an empty __init__.py"""
    init = path / "__init__.py"
    if not init.exists():
        init.write_text("")
        log(f"Created: {init}")

def copy_tree_with_init(src: Path, dst: Path):
    """Copy a directory tree and create __init__.py files"""
    if not src.exists():
        log(f"Source not found: {src}", "WARN")
        return
    
    if dst.exists():
        shutil.rmtree(dst)
    
    shutil.copytree(src, dst)
    log(f"Copied: {src} -> {dst}")
    
    # Create __init__.py for all directories
    for root, dirs, files in os.walk(dst):
        root_path = Path(root)
        if "__init__.py" not in files:
            create_init_file(root_path)

def copy_file(src: Path, dst: Path):
    """Copy a single file"""
    if not src.exists():
        log(f"Source file not found: {src}", "WARN")
        return False
    
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)
    log(f"Copied file: {src} -> {dst}")
    return True

def fix_imports_in_file(file_path: Path) -> Tuple[bool, List[str]]:
    """Fix imports in a Python file. Returns (modified, changes)"""
    if not file_path.suffix == ".py":
        return False, []
    
    try:
        content = file_path.read_text(encoding='utf-8')
    except Exception as e:
        log(f"Error reading {file_path}: {e}", "ERROR")
        return False, []
    
    original_content = content
    changes = []
    
    # Replace "from api." with "from app."
    if "from api." in content or "from api/" in content:
        new_content = re.sub(IMPORT_PATTERN, IMPORT_REPLACEMENT, content)
        if new_content != content:
            changes.append(f"Fixed imports in {file_path.name}")
            content = new_content
    
    if content != original_content:
        try:
            file_path.write_text(content, encoding='utf-8')
            log(f"Updated imports: {file_path.relative_to(BACKEND_ROOT)}")
            return True, changes
        except Exception as e:
            log(f"Error writing {file_path}: {e}", "ERROR")
            return False, changes
    
    return False, []

def fix_imports_in_tree(root: Path) -> Dict[str, List[str]]:
    """Fix imports recursively in a directory tree"""
    fixed_files = {}
    
    for py_file in root.rglob("*.py"):
        # Skip __pycache__
        if "__pycache__" in str(py_file):
            continue
        
        modified, changes = fix_imports_in_file(py_file)
        if modified:
            fixed_files[str(py_file.relative_to(BACKEND_ROOT))] = changes
    
    return fixed_files

def create_mapping_file(mapping: Dict[str, str]):
    """Create a mapping file for reference"""
    mapping_file = BACKEND_ROOT / "backend_migration_map.txt"
    
    content = "Backend Migration Mapping (Old -> New)\n"
    content += "=" * 60 + "\n\n"
    
    for old, new in sorted(mapping.items()):
        content += f"{old} -> {new}\n"
    
    mapping_file.write_text(content)
    log(f"Created mapping file: {mapping_file}")

def main():
    log("Starting backend migration...")
    log(f"Source: {SERVER_API}")
    log(f"Target: {BACKEND_APP}")
    
    # Step 1: Create directory structure
    log("\n=== STEP 1: Creating directory structure ===")
    BACKEND_ROOT.mkdir(parents=True, exist_ok=True)
    BACKEND_APP.mkdir(parents=True, exist_ok=True)
    (BACKEND_ROOT / "migrations").mkdir(parents=True, exist_ok=True)
    (BACKEND_ROOT / "tests").mkdir(parents=True, exist_ok=True)
    (BACKEND_ROOT / "scripts").mkdir(parents=True, exist_ok=True)
    (BACKEND_ROOT / "seeders").mkdir(parents=True, exist_ok=True)
    (BACKEND_APP / "repositories").mkdir(parents=True, exist_ok=True)
    
    # Step 2: Copy directories with trees
    log("\n=== STEP 2: Copying directories ===")
    directories_copied = []
    
    for src, dst in COPY_MAPPINGS.items():
        if src.is_dir():
            copy_tree_with_init(src, dst)
            directories_copied.append(f"{src.relative_to(REPO_ROOT)} -> {dst.relative_to(REPO_ROOT)}")
    
    # Step 3: Copy individual files
    log("\n=== STEP 3: Copying configuration files ===")
    files_copied = []
    
    for src, dst in FILE_COPIES.items():
        if copy_file(src, dst):
            files_copied.append(f"{src.relative_to(REPO_ROOT)} -> {dst.relative_to(REPO_ROOT)}")
    
    # Step 4: Fix imports
    log("\n=== STEP 4: Fixing imports in all Python files ===")
    fixed_imports = fix_imports_in_tree(BACKEND_APP)
    
    # Also fix imports in tests if they exist
    if (BACKEND_ROOT / "tests").exists():
        fixed_imports.update(fix_imports_in_tree(BACKEND_ROOT / "tests"))
    
    if (BACKEND_ROOT / "scripts").exists():
        fixed_imports.update(fix_imports_in_tree(BACKEND_ROOT / "scripts"))
    
    if (BACKEND_ROOT / "seeders").exists():
        fixed_imports.update(fix_imports_in_tree(BACKEND_ROOT / "seeders"))
    
    # Step 5: Create __init__.py in backend root
    create_init_file(BACKEND_APP)
    
    # Step 6: Create mapping file
    log("\n=== STEP 5: Creating migration report ===")
    all_mappings = {}
    for src, dst in COPY_MAPPINGS.items():
        all_mappings[str(src.relative_to(REPO_ROOT))] = str(dst.relative_to(REPO_ROOT))
    for src, dst in FILE_COPIES.items():
        all_mappings[str(src.relative_to(REPO_ROOT))] = str(dst.relative_to(REPO_ROOT))
    
    create_mapping_file(all_mappings)
    
    # Print summary
    log("\n" + "=" * 60)
    log("MIGRATION SUMMARY")
    log("=" * 60)
    log(f"\nDirectories copied: {len(directories_copied)}")
    for item in directories_copied:
        print(f"  ✓ {item}")
    
    log(f"\nFiles copied: {len(files_copied)}")
    for item in files_copied:
        print(f"  ✓ {item}")
    
    log(f"\nFiles with fixed imports: {len(fixed_imports)}")
    for file_path, changes in sorted(fixed_imports.items()):
        print(f"  ✓ {file_path}")
        for change in changes:
            print(f"    - {change}")
    
    log("\n" + "=" * 60)
    log("✓ Backend migration completed successfully!")
    log("=" * 60)
    
    return 0

if __name__ == "__main__":
    exit(main())
