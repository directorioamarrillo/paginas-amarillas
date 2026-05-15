"""Script sencillo para generar y enviar reportes periódicos por email.

Usa variables de entorno para configuración SMTP.
"""
import os
import smtplib
from email.message import EmailMessage
import requests

API_URL = os.environ.get('API_URL', 'http://localhost:8000')
API_TOKEN = os.environ.get('API_TOKEN')
SMTP_HOST = os.environ.get('SMTP_HOST')
SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
SMTP_USER = os.environ.get('SMTP_USER')
SMTP_PASS = os.environ.get('SMTP_PASS')
TO_EMAIL = os.environ.get('TO_EMAIL')

def fetch_pdf_report():
    headers = {'Authorization': f'Bearer {API_TOKEN}'} if API_TOKEN else {}
    r = requests.get(f'{API_URL}/api/auditoria/report/summary/pdf', headers=headers, params={})
    r.raise_for_status()
    return r.content

def send_email(pdf_bytes):
    msg = EmailMessage()
    msg['Subject'] = 'Reporte resumen de auditoría'
    msg['From'] = SMTP_USER
    msg['To'] = TO_EMAIL
    msg.set_content('Adjunto el reporte de actividad.')
    msg.add_attachment(pdf_bytes, maintype='application', subtype='pdf', filename='reporte_resumen_auditoria.pdf')

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as s:
        s.starttls()
        s.login(SMTP_USER, SMTP_PASS)
        s.send_message(msg)

def main():
    pdf = fetch_pdf_report()
    send_email(pdf)

if __name__ == '__main__':
    main()
