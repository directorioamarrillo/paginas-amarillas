import requests
import sys

base = "http://localhost:8000/api"
admin_email = "admin@admin.com"
admin_password = "12345678"

session = requests.Session()
try:
    r = session.post(f"{base}/signin", data={"username": admin_email, "password": admin_password}, timeout=10)
except Exception as e:
    print('ERROR signin admin:', e)
    sys.exit(1)

if r.status_code != 200:
    print('ADMIN SIGNIN FAILED', r.status_code, r.text)
    sys.exit(1)

token = r.json().get('access_token')
headers = {'Authorization': f'Bearer {token}'}

# cambiar id si es necesario
usuario_id = 4
r = requests.get(f"{base}/usuarios/{usuario_id}", headers=headers, timeout=10)
print('GET /usuarios/{0} ->'.format(usuario_id), r.status_code)
try:
    print(r.json())
except Exception:
    print(r.text)
