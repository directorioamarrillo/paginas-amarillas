import requests
import time

url = "http://127.0.0.1:8000/api/signin"
payload = {
    "username": "test@test.com",
    "password": "wrongpassword123"
}

for i in range(7):
    print(f"Attempt {i+1}...")
    response = requests.post(url, data=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    time.sleep(0.5)
