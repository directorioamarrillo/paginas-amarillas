"""
Backend Migration Script - Execute this file with: python -c "exec(open('final_migration.py').read())"
Or import it: python -c "import final_migration"
"""

import os
import sys
import shutil
import re
from pathlib import Path

def execute_migration():
    """Main migration function"""
    os.chdir(r"c:\Users\santi\Documents\DIRECTORIO2.0")
    
    REPO_ROOT = Path(r"c:\Users\santi\Documents\DIRECTORIO2.0")
    SERVER_API = REPO_ROOT / "server" / "api"
    BACKEND_ROOT = REPO_ROOT / "backend"
    BACKEND_APP = BACKEND_ROOT / "app"
    
    print("[MIGRATION] Starting backend migration...")
    print(f"[MIGRATION] Source: {SERVER_API}")
    print(f"[MIGRATION] Target: {BACKEND_APP}\n")
    
    # Step 1: Create directory structure
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
    print("  ✓ Directory structure created\n")
    
    # Step 2: Copy main.py
    print("[2/6] Copying main.py...")
    src = SERVER_API / "main.py"
    dst = BACKEND_APP / "main.py"
    if src.exists():
        shutil.copy2(src, dst)
        print("  ✓ Copied main.py\n")
    
    # Step 3: Copy subdirectories
    print("[3/6] Copying subdirectories from server/api...")
    dirs_to_copy = ["api", "models", "schemas", "services", "core", "db", "utils", "scheduler"]
    
    for dir_name in dirs_to_copy:
        src = SERVER_API / dir_name
        dst = BACKEND_APP / dir_name
        if src.exists() and src.is_dir():
            if dst.exists():
                shutil.rmtree(dst)
            shutil.copytree(src, dst)
            print(f"  ✓ Copied {dir_name}")
    print()
    
    # Step 4: Copy configuration directories
    print("[4/6] Copying configuration directories...")
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
    print()
    
    # Step 5: Copy configuration files
    print("[5/6] Copying configuration files...")
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
    print()
    
    # Step 6: Fix imports and create __init__.py files
    print("[6/6] Fixing imports and creating __init__.py files...")
    
    IMPORT_PATTERN = r'\bfrom\s+api(\.|/)'
    IMPORT_REPLACEMENT = r'from app\1'
    
    fixed_count = 0
    init_count = 0
    error_count = 0
    
    # Process all files
    for item in sorted(BACKEND_ROOT.rglob("*")):
        # Create __init__.py in directories
        if item.is_dir() and "__pycache__" not in str(item):
            init_path = item / "__init__.py"
            if not init_path.exists():
                try:
                    init_path.write_text("")
                    init_count += 1
                except Exception as e:
                    print(f"  ! Error creating __init__.py in {item}: {e}")
                    error_count += 1
        
        # Fix imports in Python files
        if item.is_file() and item.suffix == ".py" and "__pycache__" not in str(item):
            try:
                content = item.read_text(encoding='utf-8')
                if "from api." in content or "from api/" in content:
                    new_content = re.sub(IMPORT_PATTERN, IMPORT_REPLACEMENT, content)
                    if new_content != content:
                        item.write_text(new_content, encoding='utf-8')
                        fixed_count += 1
            except Exception as e:
                print(f"  ! Error processing {item}: {e}")
                error_count += 1
    
    print(f"  ✓ Fixed imports in {fixed_count} files")
    print(f"  ✓ Created {init_count} __init__.py files")
    if error_count > 0:
        print(f"  ⚠ Encountered {error_count} errors\n")
    else:
        print()
    
    # Print summary
    print("=" * 70)
    print("MIGRATION COMPLETED SUCCESSFULLY!")
    print("=" * 70)
    print(f"\n✓ Backend structure created at: {BACKEND_ROOT}")
    print(f"✓ Main application code at: {BACKEND_APP}")
    print(f"✓ Total files with fixed imports: {fixed_count}")
    print(f"✓ Total __init__.py files created: {init_count}")
    print(f"✓ Errors encountered: {error_count}\n")
    
    print("Directory structure:")
    try:
        for item in sorted(BACKEND_ROOT.iterdir()):
            if item.is_dir():
                print(f"  📁 {item.name}/")
            else:
                print(f"  📄 {item.name}")
    except Exception as e:
        print(f"  Error listing directory: {e}")
    
    print("\n" + "=" * 70)
    print("NEXT STEPS:")
    print("=" * 70)
    print("1. Verify the backend/ directory structure")
    print("2. Check that imports have been correctly updated")
    print("3. Run tests to verify functionality")
    print("4. Update any remaining configuration files if needed")
    print("=" * 70 + "\n")
    
    return 0

# Execute when file is run or imported
if __name__ == "__main__":
    try:
        sys.exit(execute_migration())
    except Exception as e:
        print(f"\n[ERROR] Migration failed with exception: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
else:
    # Execute when imported
    try:
        execute_migration()
    except Exception as e:
        print(f"[ERROR] Migration failed: {e}")
        import traceback
        traceback.print_exc()
