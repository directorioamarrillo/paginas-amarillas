import urllib.request, urllib.parse, json, sys
BASE='http://127.0.0.1:8000'
# Sign in
data = urllib.parse.urlencode({'username':'admin@admin.com','password':'12345678'}).encode()
req = urllib.request.Request(BASE+'/api/signin', data=data)
try:
    with urllib.request.urlopen(req, timeout=10) as r:
        body = r.read().decode()
        print('SIGNIN_RESPONSE:', body)
        j = json.loads(body)
        token = j.get('access_token') or j.get('token') or j.get('data', {}).get('access_token')
        if not token:
            print('No token found, exiting')
            sys.exit(2)
except Exception as e:
    print('SIGNIN_ERROR:', e)
    sys.exit(1)
# Call summary
hdr = {'Authorization': 'Bearer '+token}
for path in ['/api/auditoria/report/summary','/api/auditoria/report/timeseries']:
    req = urllib.request.Request(BASE+path, headers=hdr)
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            b = r.read().decode()
            print(path, 'STATUS', r.getcode())
            print('BODY_SNIPPET:', b[:1000])
    except Exception as e:
        print(path, 'ERROR', e)
# Try PDF
req = urllib.request.Request(BASE+'/api/auditoria/report/summary/pdf', headers=hdr)
try:
    with urllib.request.urlopen(req, timeout=20) as r:
        data = r.read()
        print('/api/auditoria/report/summary/pdf STATUS', r.getcode(), 'LEN', len(data))
        open('tmp_reporte_resumen.pdf','wb').write(data)
        print('Saved tmp_reporte_resumen.pdf')
except Exception as e:
    print('/api/auditoria/report/summary/pdf ERROR', e)
