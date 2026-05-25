import os
import sys

# Set up path and working directory
sys.path.insert(0, r'c:\Users\santi\Documents\DIRECTORIO2.0')
os.chdir(r'c:\Users\santi\Documents\DIRECTORIO2.0')

# Import the migration module and run it
if __name__ == "__main__":
    import importlib.util
    spec = importlib.util.spec_from_file_location("migrate_backend", r'c:\Users\santi\Documents\DIRECTORIO2.0\migrate_backend.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
