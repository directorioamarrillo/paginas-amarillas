import requests
base='http://localhost:8000/api'
admin_email='admin@admin.com'
admin_password='12345678'

r=requests.post(f"{base}/signin", data={'username':admin_email,'password':admin_password})
print('admin signin ->', r.status_code)
try:
    print(r.json())
except:
    print(r.text)
