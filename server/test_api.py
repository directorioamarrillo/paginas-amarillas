import urllib.request
import urllib.parse
import json

# Reset admin password via bootstrap-admin
url_bootstrap = "http://localhost:8000/api/bootstrap-admin"
payload_bootstrap = {
    "secret": "dev-admin-secret",
    "correo": "admin@paginas360.com",
    "nombre": "Admin",
    "apellido": "Principal",
    "password": "secret"
}
data_bootstrap = json.dumps(payload_bootstrap).encode("utf-8")
req_bootstrap = urllib.request.Request(url_bootstrap, data=data_bootstrap, method="POST")
req_bootstrap.add_header("Content-Type", "application/json")

try:
    with urllib.request.urlopen(req_bootstrap) as res_boot:
        boot_data = json.loads(res_boot.read().decode("utf-8"))
        print("Bootstrap Response:", boot_data)
        
    # Now, test signin
    url_signin = "http://localhost:8000/api/signin"
    data = urllib.parse.urlencode({"username": "admin@paginas360.com", "password": "secret"}).encode("utf-8")
    req = urllib.request.Request(url_signin, data=data, method="POST")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")

    with urllib.request.urlopen(req) as res:
        res_data = json.loads(res.read().decode("utf-8"))
        print("Signin Response:", res_data)
        token = res_data["access_token"]
        
        # Test mePermisos
        url_perms = "http://localhost:8000/api/me/permisos"
        req_perms = urllib.request.Request(url_perms, method="GET")
        req_perms.add_header("Authorization", f"Bearer {token}")
        
        with urllib.request.urlopen(req_perms) as res_perms:
            perms_data = json.loads(res_perms.read().decode("utf-8"))
            print("me/permisos Response:", perms_data)
except Exception as e:
    print("Error:", e)
