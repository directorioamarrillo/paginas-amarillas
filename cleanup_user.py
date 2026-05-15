import requests
base='http://localhost:8000/api'
admin_email='admin@admin.com'
admin_password='12345678'

s=requests.Session()
r=s.post(f"{base}/signin", data={'username':admin_email,'password':admin_password})
if r.status_code!=200:
    print('signin admin failed', r.status_code, r.text)
    raise SystemExit(1)

token=r.json().get('access_token')
headers={'Authorization':f'Bearer {token}'}

r=s.get(f"{base}/usuarios/", headers=headers)
print('GET usuarios ->', r.status_code)
users=r.json()
for u in users:
    if u.get('correo')=='comerciante.e2e@example.com':
        uid=u.get('id')
        print('Found comerciante id:', uid)
        rd=s.delete(f"{base}/usuarios/{uid}", headers=headers)
        print('DELETE ->', rd.status_code, rd.text)
        break
else:
    print('Usuario no encontrado en la primera página. No se eliminó.')
