import subprocess
import sys

result = subprocess.run([
    sys.executable,
    r'c:\Users\santi\Documents\DIRECTORIO2.0\simple_migrate.py'
], cwd=r'c:\Users\santi\Documents\DIRECTORIO2.0', capture_output=True, text=True)

print(result.stdout)
if result.stderr:
    print("STDERR:", result.stderr)
print("Return code:", result.returncode)
