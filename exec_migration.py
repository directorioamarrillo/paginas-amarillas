import os
import sys
os.chdir(r'c:\Users\santi\Documents\DIRECTORIO2.0')
sys.path.insert(0, r'c:\Users\santi\Documents\DIRECTORIO2.0')

# Execute the migration script
with open('migrate_backend.py', 'r') as f:
    code = f.read()
    exec(code)
