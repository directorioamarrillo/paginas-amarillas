#!/usr/bin/env python3
import subprocess
import sys

result = subprocess.run([
    sys.executable, "-c", 
    "exec(open(r'c:\\Users\\santi\\Documents\\DIRECTORIO2.0\\final_migration.py').read())"
], cwd=r"c:\Users\santi\Documents\DIRECTORIO2.0")

sys.exit(result.returncode)
