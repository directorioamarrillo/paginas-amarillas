import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

class EmailService:
    @staticmethod
    def send_verification_email(to_email: str, code: str):
        if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            print(f"SMTP no configurado. Código generado para {to_email}: {code}")
            return False

        subject = "Verifica tu cuenta - Directorio"
        body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 10px; border: 1px solid #e0e0e0;">
                    <h2 style="color: #FBBF24; text-align: center;">¡Bienvenido al Directorio!</h2>
                    <p>Hola,</p>
                    <p>Gracias por registrarte. Para poder usar todas las funciones de tu cuenta, por favor verifica tu correo electrónico ingresando el siguiente código:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1F2937; background-color: #F3F4F6; padding: 10px 20px; border-radius: 5px;">{code}</span>
                    </div>
                    <p>Este código expirará en 15 minutos.</p>
                    <p>Si tú no solicitaste este registro, puedes ignorar este correo.</p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />
                    <p style="font-size: 12px; color: #777; text-align: center;">El equipo del Directorio</p>
                </div>
            </body>
        </html>
        """

        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_USER
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'html'))

        try:
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
            server.quit()
            print(f"Correo de verificación enviado a {to_email}")
            return True
        except Exception as e:
            print(f"Error enviando correo a {to_email}: {str(e)}")
            return False
