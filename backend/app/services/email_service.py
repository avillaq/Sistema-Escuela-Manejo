from flask_mail import Message
from flask import current_app
from concurrent.futures import ThreadPoolExecutor
import smtplib

# 3 hilos
email_executor = ThreadPoolExecutor(max_workers=3, thread_name_prefix="email-")

class EmailService:
    def __init__(self):
        self.executor = email_executor
    
    def enviar_async(self, destinatario, asunto, cuerpo):
        app = current_app._get_current_object()
        self.executor.submit(self._enviar_sync, app, destinatario, asunto, cuerpo)
    
    def _enviar_sync(self, app, destinatario, asunto, cuerpo):
        with app.app_context():
          try:
              mail = current_app.extensions.get("mail")
              if not mail:
                  print("Flask-Mail no inicializado")
                  return False
                  
              msg = Message(
                  asunto,
                  sender=current_app.config["MAIL_USERNAME"],
                  recipients=[destinatario]
              )
              msg.body = cuerpo
              
              # Usar contexto de aplicación para threads
              with current_app.app_context():
                  mail.send(msg)
                  print(f"Email enviado exitosamente a: {destinatario}")
                  return True
                  
          except smtplib.SMTPAuthenticationError as e:
              print(f"Error SMTP autenticación: {str(e)}")
              return False
          except Exception as e:
              print(f"Error enviando email a {destinatario}: {str(e)}")
              return False
    
    def enviar_bienvenida(self, alumno):
        asunto = "¡Bienvenido a la Escuela de Manejo Jesús Nazareno!"
        cuerpo = f"""
                Hola {alumno.nombre},

                ¡Te damos la bienvenida a nuestra escuela de manejo!

                Datos de tu cuenta:
                - Nombre: {alumno.nombre} {alumno.apellidos}
                - DNI: {alumno.dni}
                - Email: {alumno.email}

                Para iniciar sesión usa tu DNI como usuario y contraseña.

                ¡Nos vemos en clase!

                Atentamente,
                Escuela de Manejo Jesús Nazareno
                """
        self.enviar_async(alumno.email, asunto, cuerpo)

    def enviar_recordatorio_reserva(self, reserva):
        """Recordatorio de reserva próxima"""
        alumno = reserva.matricula.alumno
        asunto = "Recordatorio: Tienes una clase programada"
        cuerpo = f"""
                Hola {alumno.nombre},

                Te recordamos que tienes una clase programada:

                📅 Fecha: {reserva.bloque.fecha}
                🕐 Hora: {reserva.bloque.hora_inicio} - {reserva.bloque.hora_fin}
                ⏱️ Duración: {reserva.duracion_horas} horas

                ¡No faltes!

                Escuela de Manejo Jesús Nazareno
                """
        self.enviar_async(alumno.email, asunto, cuerpo)
    
    def enviar_pago_pendiente(self, matricula):
        """Recordatorio de pago pendiente"""
        alumno = matricula.alumno
        asunto = "Recordatorio: Pago pendiente"
        cuerpo = f"""
              Hola {alumno.nombre},

              Te recordamos que tienes un pago pendiente:

              💰 Monto: S/ {matricula.monto_pendiente}
              📋 Categoría: {matricula.categoria}

              Por favor, acércate a la escuela para regularizar tu situación.

              Escuela de Manejo Jesús Nazareno
              """
        self.enviar_async(alumno.email, asunto, cuerpo)

email_service = EmailService()