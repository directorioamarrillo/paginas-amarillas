#!/usr/bin/env python3
"""Direct migration executor"""
import subprocess
import sys
import os

os.chdir(r"c:\Users\santi\Documents\DIRECTORIO2.0")

# Try to run the migration
try:
    result = subprocess.run([sys.executable, "simple_exec_migration.py"], 
                          capture_output=False, text=True)
    sys.exit(result.returncode)
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
