import os
import sys

# Asegurar que el directorio `server` (padre de este script) está en sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

modules = [
    "app.api.auth",
    "app.api.categorias",
    "app.api.departamentos",
    "app.api.empresas",
    "app.api.municipios",
    "app.api.publicidad",
    "app.api.resultados",
    "app.api.review",
    "app.api.usuarios",
    "app.api.marketplace",
]

for m in modules:
    try:
        mod = __import__(m, fromlist=['router'])
        print(m, 'OK', 'router' in dir(mod))
    except Exception as e:
        print(m, 'ERROR', type(e).__name__, str(e))
