from flask_mail import Message
from flask import current_app
import smtplib

def enviar_correo(destinatario, asunto, cuerpo):
    msg = Message(
        asunto,
        sender=current_app.config['MAIL_USERNAME'],
        recipients=[destinatario]
    )
    msg.body = cuerpo

    mail = current_app.extensions.get('mail')
    if not mail:
        raise RuntimeError("Mail no ha sido inicializado en la app.")

    try:
        mail.send(msg)
    except smtplib.SMTPAuthenticationError:
        # Aquí ya no se lanza el error, solo se informa
        print("No se pudo enviar el correo: Error de autenticación SMTP")
        return False
    except Exception as e:
        print(f"No se pudo enviar el correo: {str(e)}")
        return False
    return True