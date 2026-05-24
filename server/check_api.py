import urllib.request, urllib.parse, json, sys, time
BASE='http://127.0.0.1:8000'
for i in range(8):
    try:
        with urllib.request.urlopen(BASE+'/health', timeout=3) as r:
            if r.getcode()==200:
                print('HEALTH OK')
                break
    except Exception as e:
        time.sleep(1)
else:
    print('HEALTH FAIL'); sys.exit(2)
# Signin
data = urllib.parse.urlencode({'username':'admin@admin.com','password':'12345678'}).encode()
req = urllib.request.Request(BASE+'/api/signin', data=data)
with urllib.request.urlopen(req, timeout=10) as r:
    body=r.read().decode(); print('SIGNIN', body[:400])
    j=json.loads(body)
    token = j.get('access_token') or j.get('token') or j.get('data', {}).get('access_token')
# endpoints
hdr={'Authorization':'Bearer '+token}
for path in ['/api/auditoria/report/summary','/api/auditoria/report/timeseries']:
    req=urllib.request.Request(BASE+path, headers=hdr)
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            b=r.read().decode(); print(path, 'OK len', len(b))
            print('snippet', b[:200])
    except Exception as e:
        print(path, 'ERROR', e)
# pdf
req=urllib.request.Request(BASE+'/api/auditoria/report/summary/pdf', headers=hdr)
try:
    with urllib.request.urlopen(req, timeout=20) as r:
        data=r.read()
        print('PDF OK', len(data))
except Exception as e:
    print('PDF ERROR', e)
