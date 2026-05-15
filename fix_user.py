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

# find deleted user
r=s.get(f"{base}/usuarios/", headers=headers)
users=r.json()
uid=None
for u in users:
    if u.get('correo')=='comerciante.e2e@example.com':
        uid=u.get('id')
        print('Found user id', uid)
        break
if not uid:
    print('Usuario no encontrado')
    raise SystemExit(1)

# Hash new password with server's pwdlib
pwd_ctx=PasswordHash.recommended()
new_hashed = pwd_ctx.hash('Comerciante123')
print('Hashed password len', len(new_hashed))

# Update user with hashed password
r = s.put(f"{base}/usuarios/{uid}", headers=headers, json={'password': new_hashed})
print('PUT /usuarios ->', r.status_code, r.text)

# Restore user
r = s.patch(f"{base}/usuarios/{uid}/restore", headers=headers)
print('PATCH restore ->', r.status_code, r.text)
