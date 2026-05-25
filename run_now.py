#!/usr/bin/env python3
import subprocess
import sys

result = subprocess.run([sys.executable, r"c:\Users\santi\Documents\DIRECTORIO2.0\inline_migration.py"], 
                       capture_output=False, text=True)
sys.exit(result.returncode)
