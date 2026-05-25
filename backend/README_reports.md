Instrucciones para reportes automáticos y envío por email

Resumen
- Se añadió un endpoint POST `/api/auditoria/report/send` que genera el PDF resumen y lo envía por email.
- Existe un scheduler opcional que, si se habilita, ejecuta diariamente el envío.

Variables de entorno relevantes
- REPORT_SMTP_HOST: host SMTP (ej: smtp.gmail.com)
- REPORT_SMTP_PORT: puerto SMTP (por defecto 587)
- REPORT_SMTP_USER: usuario SMTP (opcional)
- REPORT_SMTP_PASSWORD: contraseña SMTP (opcional)
- REPORT_SMTP_FROM: dirección "From"; si no, se usa REPORT_SMTP_USER
- REPORT_RECIPIENTS: lista coma-separada de destinatarios para envíos automáticos
- ENABLE_REPORT_SCHEDULER: si se pone a `1`, se activa el scheduler diario
- REPORT_SCHEDULE_HOUR: hora diaria en formato `HH:MM` (por defecto `09:00`)

Cómo probar manualmente
1) Arranca la API (venv activado):

```powershell
cd server
.\venv\Scripts\python.exe -m uvicorn api.main:app --host 127.0.0.1 --port 8000
```

2) Haz `signin` como admin y llama al endpoint para enviar ahora:

```powershell
# obtiene token
$t = Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/signin' -Method Post -Body @{username='admin@admin.com'; password='12345678'}
$hdr = @{Authorization = 'Bearer ' + $t.access_token}
# enviar reporte (usa REPORT_RECIPIENTS si no pasas recipients)
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/auditoria/report/send' -Method Post -Headers $hdr -Body @{recipients='ops@example.com'}
```

Notas de seguridad
- No guardes contraseñas en repositorio. Usa un secreto en el orquestador o variables de entorno protegidas.

Despliegue
- Para activar envíos periódicos en producción, exporta `ENABLE_REPORT_SCHEDULER=1` y configura `REPORT_SCHEDULE_HOUR`.
- Alternativa: usa un scheduler externo (cron, sistema de tareas, o worker) que haga POST al endpoint `/api/auditoria/report/send`.

Problemas conocidos
- El envío se realiza mediante SMTP estándar; si usas proveedores que requieren OAuth (Gmail), configura un user/password válido o usa un relay.
- Si `reportlab` no está instalado, los endpoints PDF devuelven 501; instala `reportlab` en el entorno.
