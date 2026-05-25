#!/usr/bin/env python3
"""
AUTO-EXECUTING MIGRATION MODULE
This module executes the migration upon import.
Simply running: python -m auto_exec_migrate
Or importing it will trigger the migration
"""

def _execute_migration():
    """Execute the migration immediately upon module load"""
    import os
    import sys
    import shutil
    import re
    from pathlib import Path
    
    try:
        # Set working directory
        os.chdir(r"c:\Users\santi\Documents\DIRECTORIO2.0")
        
        REPO_ROOT = Path(r"c:\Users\santi\Documents\DIRECTORIO2.0")
        SERVER_API = REPO_ROOT / "server" / "api"
        BACKEND_ROOT = REPO_ROOT / "backend"
        BACKEND_APP = BACKEND_ROOT / "app"
        
        print("\n[AUTO-MIGRATION] Starting backend migration...\n")
        
        # Step 1: Create directories
        print("[1/6] Creating directory structure...")
        for d in [BACKEND_ROOT, BACKEND_APP, BACKEND_ROOT / "migrations", BACKEND_ROOT / "tests", BACKEND_ROOT / "scripts", BACKEND_ROOT / "seeders", BACKEND_APP / "repositories"]:
            d.mkdir(parents=True, exist_ok=True)
        print("  ✓ Directories created\n")
        
        # Step 2: Copy main.py
        print("[2/6] Copying main.py...")
        shutil.copy2(SERVER_API / "main.py", BACKEND_APP / "main.py")
        print("  ✓ Copied\n")
        
        # Step 3: Copy subdirectories
        print("[3/6] Copying subdirectories...")
        for dir_name in ["api", "models", "schemas", "services", "core", "db", "utils", "scheduler"]:
            src = SERVER_API / dir_name
            dst = BACKEND_APP / dir_name
            if src.exists():
                if dst.exists():
                    shutil.rmtree(dst)
                shutil.copytree(src, dst)
                print(f"  ✓ Copied {dir_name}")
        print()
        
        # Step 4: Copy configuration directories
        print("[4/6] Copying configuration directories...")
        for src_rel, dst_name in [("server/alembic", "migrations"), ("server/tests", "tests"), ("server/scripts", "scripts"), ("server/seeders", "seeders")]:
            src = REPO_ROOT / src_rel
            dst = BACKEND_ROOT / dst_name
            if src.exists():
                if dst.exists():
                    shutil.rmtree(dst)
                shutil.copytree(src, dst)
                print(f"  ✓ Copied {src_rel} -> {dst_name}")
        print()
        
        # Step 5: Copy configuration files
        print("[5/6] Copying configuration files...")
        for src_name, dst_name in [("requirements.txt", "requirements.txt"), ("requirements-extras.txt", "requirements-extras.txt"), ("Dockerfile", "Dockerfile"), (".env.example", ".env.example"), (".gitignore", ".gitignore"), ("alembic.ini", "alembic.ini")]:
            src = REPO_ROOT / "server" / src_name
            dst = BACKEND_ROOT / dst_name
            if src.exists():
                shutil.copy2(src, dst)
                print(f"  ✓ Copied {src_name}")
        print()
        
        # Step 6: Fix imports and create __init__.py
        print("[6/6] Fixing imports and creating __init__.py files...")
        IMPORT_PATTERN = r'\bfrom\s+api(\.|/)'
        IMPORT_REPLACEMENT = r'from app\1'
        fixed = 0
        init_created = 0
        
        for item in BACKEND_ROOT.rglob("*"):
            if item.is_dir() and "__pycache__" not in str(item):
                init_file = item / "__init__.py"
                if not init_file.exists():
                    init_file.touch()
                    init_created += 1
            
            if item.is_file() and item.suffix == ".py" and "__pycache__" not in str(item):
                try:
                    content = item.read_text(encoding='utf-8')
                    if "from api." in content or "from api/" in content:
                        new_content = re.sub(IMPORT_PATTERN, IMPORT_REPLACEMENT, content)
                        if new_content != content:
                            item.write_text(new_content, encoding='utf-8')
                            fixed += 1
                except Exception as e:
                    print(f"  ! Error processing {item}: {e}")
        
        print(f"  ✓ Fixed imports in {fixed} files")
        print(f"  ✓ Created {init_created} __init__.py files\n")
        
        # Print summary
        print("=" * 70)
        print("✓ MIGRATION COMPLETED SUCCESSFULLY!")
        print("=" * 70)
        print(f"\n✓ Backend structure: {BACKEND_ROOT}")
        print(f"✓ Application code:  {BACKEND_APP}")
        print(f"✓ Fixed imports:     {fixed} files")
        print(f"✓ Created __init__:  {init_created} files\n")
        
        # Verify structure
        print("Directory structure created:")
        for item in sorted(BACKEND_ROOT.iterdir()):
            if item.is_dir():
                print(f"  📁 {item.name}/")
            else:
                print(f"  📄 {item.name}")
        print()
        
        return True
        
    except Exception as e:
        print(f"\n[ERROR] Migration failed: {e}")
        import traceback
        traceback.print_exc()
        return False

# Execute on import
_MIGRATION_SUCCESS = _execute_migration()

# Also allow running as main
if __name__ == "__main__":
    import sys
    sys.exit(0 if _MIGRATION_SUCCESS else 1)
