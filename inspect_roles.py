import requests
base='http://localhost:8000/api'
admin_email='admin@admin.com'
admin_password='12345678'

s=requests.Session()
r=s.post(f"{base}/signin", data={'username':admin_email,'password':admin_password})
if r.status_code!=200:
    print('signin failed', r.status_code, r.text)
    raise SystemExit(1)
token=r.json().get('access_token')
headers={'Authorization':f'Bearer {token}'}

r=s.get(f"{base}/roles/", headers=headers)
print('GET /roles ->', r.status_code)
try:
    print(r.json())
except:
    print(r.text)
