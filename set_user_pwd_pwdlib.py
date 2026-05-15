import requests
from pwdlib import PasswordHash
base='http://localhost:8000/api'
admin_email='admin@admin.com'
admin_password='12345678'

s=requests.Session()
r=s.post(f"{base}/signin", data={'username':admin_email,'password':admin_password})
if r.status_code!=200:
    print('signin admin failed', r.status_code, r.text)
    raise SystemExit(1)

token=r.json().get('access_token')
headers={'Authorization':f'Bearer {token}','Content-Type':'application/json'}

usuario_id = 4
pwd_ctx=PasswordHash.recommended()
new_hashed = pwd_ctx.hash('Comerciante123')

payload={'nombre':'Comerciante E2E','apellido':'Prueba','correo':'comerciante.e2e@example.com','password':new_hashed}

r = s.put(f"{base}/usuarios/{usuario_id}", headers=headers, json=payload)
print('PUT ->', r.status_code, r.text)
