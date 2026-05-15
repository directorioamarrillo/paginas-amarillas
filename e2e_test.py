import requests
import sys

base = "http://localhost:8000/api"
admin_email = "admin@admin.com"
admin_password = "12345678"

session = requests.Session()

try:
    r = session.post(f"{base}/signin", data={"username": admin_email, "password": admin_password}, timeout=10)
except Exception as e:
    print("ERROR: no se puede conectar al backend en http://localhost:8000/api — arranca el servidor y prueba de nuevo.", str(e))
    sys.exit(1)

if r.status_code != 200:
    print("LOGIN ADMIN FALLIDO", r.status_code, r.text)
    sys.exit(1)

try:
    data = r.json()
except Exception as e:
    print("Respuesta signin no JSON:", r.text)
    sys.exit(1)

admin_token = data.get("access_token")
print("ADMIN LOGIN OK — token recibido (length):", len(admin_token) if admin_token else 0)
headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}

# 1) Crear empresa
empresa_payload = {
    "nombre": "Empresa E2E SA",
    "nit": "E2E-1234-XYZ",
    "correo": "e2e@example.com",
    "direccion": "Calle Falsa 123",
    "telefono": "3001234567",
    "id_categoria": 1,
    "id_municipio": 1,
}

r = requests.post(f"{base}/empresas/", headers=headers, json=empresa_payload, timeout=10)
print("Crear empresa ->", r.status_code)
if r.status_code in (200,201):
    try:
        res = r.json()
        empresa_id = res.get('id') or res.get('id')
    except Exception:
        empresa_id = None
else:
    print(r.text)
    empresa_id = None

print('empresa_id:', empresa_id)

# 2) Crear comerciante (usuario) via /usuarios/ (admin)
comerciante_payload = {
    "nombre": "Comerciante E2E",
    "apellido": "Prueba",
    "correo": "comerciante.e2e@example.com",
    "password": "Comerciante123",
    "id_rol": 3,
    "id_empresa": empresa_id
}

r = requests.post(f"{base}/usuarios/", headers=headers, json=comerciante_payload, timeout=10)
print('Crear comerciante ->', r.status_code)
if r.status_code in (200,201):
    comerciante = r.json()
    comerciante_id = comerciante.get('id')
else:
    print(r.text)
    comerciante_id = None

print('comerciante_id:', comerciante_id)

# 3) Auth as comerciante
comerciante_email = comerciante_payload['correo']
comerciante_password = comerciante_payload['password']
try:
    r = session.post(f"{base}/signin", data={"username": comerciante_email, "password": comerciante_password}, timeout=10)
except Exception as e:
    print('Error signin comerciante:', e)
    r = None

if r is None:
    comerciante_token = None
elif r.status_code == 200:
    comerciante_token = r.json().get('access_token')
    print('Comerciante login OK, token len:', len(comerciante_token) if comerciante_token else 0)
else:
    print('Signin comerciante failed:', r.status_code, r.text)
    comerciante_token = None

# 4) Crear producto como comerciante
if comerciante_token and empresa_id:
    headers_c = {"Authorization": f"Bearer {comerciante_token}", "Content-Type": "application/json"}
    producto_payload = {
        "nombre": "Producto E2E",
        "descripcion": "Producto creado en test E2E",
        "precio": 9.99,
        "stock": 10,
        "id_estado": 1,
        "id_empresa": empresa_id,
        "id_categoria": 1
    }
    r = requests.post(f"{base}/marketplace", headers=headers_c, json=producto_payload, timeout=10)
    print('Crear producto ->', r.status_code)
    try:
        print(r.json())
    except:
        print(r.text)
else:
    print('No se intentó crear producto (sin token o empresa_id)')

# 5) Deshabilitar comerciante (admin)
if comerciante_id:
    r = requests.delete(f"{base}/usuarios/{comerciante_id}", headers=headers, timeout=10)
    print('Deshabilitar comerciante ->', r.status_code)
    try:
        print(r.json())
    except:
        print(r.text)

# 6) Intentar login comerciante nuevamente
r = session.post(f"{base}/signin", data={"username": comerciante_email, "password": comerciante_password}, timeout=10)
print('Signin comerciante tras deshabilitar ->', r.status_code)
print(r.text)

print('\nE2E tests finished')
