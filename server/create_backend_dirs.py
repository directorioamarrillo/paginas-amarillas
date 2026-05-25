#!/usr/bin/env python3
"""Create backend directory structure"""
import os
import sys

base = r'c:\Users\santi\Documents\DIRECTORIO2.0\backend'
dirs = [
    os.path.join(base, 'app', 'api'),
    os.path.join(base, 'app', 'models'),
    os.path.join(base, 'app', 'schemas'),
    os.path.join(base, 'app', 'services'),
    os.path.join(base, 'app', 'core'),
    os.path.join(base, 'app', 'db'),
    os.path.join(base, 'app', 'utils'),
    os.path.join(base, 'app', 'scheduler'),
    os.path.join(base, 'app', 'repositories'),
    os.path.join(base, 'migrations'),
    os.path.join(base, 'tests'),
    os.path.join(base, 'scripts'),
    os.path.join(base, 'seeders'),
]

for d in dirs:
    os.makedirs(d, exist_ok=True)
    print(f'✓ Created: {d}')

print('\n✓ All backend directories created successfully!')
