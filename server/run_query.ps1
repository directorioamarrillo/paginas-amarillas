$t = Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/signin' -Method Post -Body @{username='admin@admin.com'; password='12345678'}
$t | ConvertTo-Json -Depth 5
$hdr = @{Authorization = 'Bearer ' + $t.access_token}
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/auditoria/report/summary' -Headers $hdr -Method Get | ConvertTo-Json -Depth 5
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/auditoria/report/timeseries' -Headers $hdr -Method Get | ConvertTo-Json -Depth 5
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/auditoria/report/summary/pdf' -Headers $hdr -Method Get -OutFile reporte_resumen.pdf
Write-Output 'WROTE_PDF'
