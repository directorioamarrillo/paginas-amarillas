import requests
base='http://localhost:8000/api'
comerciante_email='comerciante.e2e@example.com'
comerciante_password='Comerciante123'

s=requests.Session()
r=s.post(f"{base}/signin", data={'username':comerciante_email,'password':comerciante_password})
print('signin comerciante ->', r.status_code)
try:
    print(r.json())
except:
    print(r.text)

if r.status_code!=200:
    raise SystemExit(1)

token=r.json().get('access_token')
headers={'Authorization':f'Bearer {token}','Content-Type':'application/json'}

producto_payload = {
    "nombre": "Producto E2E",
    "descripcion": "Producto creado en test E2E",
    "precio": 9.99,
    "stock": 10,
    "id_estado": 1,
    "id_empresa": 5,
    "id_categoria": 1
}

r = s.post(f"{base}/marketplace", headers=headers, json=producto_payload)
print('crear producto ->', r.status_code)
try:
    print(r.json())
except:
    print(r.text)
