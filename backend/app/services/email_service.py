from flask_mail import Message
from flask import current_app
from concurrent.futures import ThreadPoolExecutor
import smtplib

# 3 hilos
email_executor = ThreadPoolExecutor(max_workers=5, thread_name_prefix="email-")

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

                ¡Te damos la más cordial bienvenida a nuestra escuela de manejo!

                Tu registro ha sido exitosamente completado. A partir de ahora formas parte de una comunidad comprometida con la educación vial segura y responsable.

                Datos de tu cuenta:
                - Nombre: {alumno.nombre} {alumno.apellidos}
                - DNI: {alumno.dni}
                - Email: {alumno.email}

                Para iniciar sesión usa tu DNI como usuario y contraseña.

                Si tienes alguna duda o necesitas ayuda, no dudes en contactarnos.
                Número: 908914487

                🚗¡Nos vemos en clase!

                Atentamente,
                Escuela de Manejo Jesús Nazareno
                """
        self.enviar_async(alumno.email, asunto, cuerpo)

    def enviar_recordatorio_reserva(self, reserva):
        alumno = reserva.matricula.alumno
        asunto = "Recordatorio: Tienes una clase programada"
        cuerpo = f"""
                Hola {alumno.nombre},

                Te recordamos que tienes una clase programada:

                📅 Fecha: {reserva.bloque.fecha}
                🕐 Hora: {reserva.bloque.hora_inicio} - {reserva.bloque.hora_fin}
                ⏱️ Duración: {reserva.duracion_horas} horas

                ¡No faltes!

                Atentamente,  
                Escuela de Manejo Jesús Nazareno
                """
        self.enviar_async(alumno.email, asunto, cuerpo)
    
    def enviar_pago_pendiente(self, matricula):
        alumno = matricula.alumno
        asunto = "Recordatorio: Pago pendiente"
        cuerpo = f"""
              Hola {alumno.nombre},

              Te recordamos que tienes un pago pendiente:

              💰 Monto: S/ {matricula.monto_pendiente}
              📋 Categoría: {matricula.categoria}

              Por favor, acércate a la escuela para regularizar tu situación.

              Atentamente,  
              Escuela de Manejo Jesús Nazareno
              """
        self.enviar_async(alumno.email, asunto, cuerpo)

    def enviar_final_clases(self, matricula):
        alumno = matricula.alumno
        tipo = matricula.tipo_contratacion
        asunto = "¡Gracias por completar tus clases en nuestra escuela!"
        cuerpo = f"""
            Hola {alumno.nombre},

            Queremos agradecerte por haber completado todas tus clases de manejo. ¡Felicidades por este logro!

            { "Como contrataste un paquete, tu plan ha finalizado con éxito." if tipo == "paquete" else "Has completado todas las horas contratadas." }

            Si deseas seguir practicando o perfeccionar tus habilidades, puedes inscribirte nuevamente eligiendo la modalidad por horas.

            Para más información, contáctanos o visita nuestras oficinas.

            ¡Gracias por confiar en nosotros!
            
            Atentamente,  
            Escuela de Manejo Jesús Nazareno
            """
        self.enviar_async(alumno.email, asunto, cuerpo)

    def enviar_matricula_creada(self, matricula):
        alumno = matricula.alumno
        asunto = "Matrícula confirmada en la Escuela de Manejo Jesús Nazareno"
        cuerpo = f"""
            Hola {alumno.nombre},

            ¡Tu matrícula ha sido registrada con éxito!

            📝 Detalles de la matrícula:
            - Categoría: {matricula.categoria}
            - Tipo de contratación: {"Paquete" if matricula.tipo_contratacion == "paquete" else  "Por hora"}
            """
        if matricula.tipo_contratacion == "por_hora":
            cuerpo += f"""- Horas contratadas: {matricula.horas_contratadas}
                    - Tarifa por hora: S/. {matricula.tarifa_por_hora:.2f}
                    """
        elif matricula.tipo_contratacion == "paquete" and matricula.paquete:
            cuerpo += f"""- Paquete: {matricula.paquete.nombre} ({matricula.paquete.horas_total} horas)
                    - Costo del paquete: S/. {matricula.paquete.costo_total:.2f}
                    """

        cuerpo += f"""
            - Fecha de matrícula: {matricula.fecha_matricula.strftime('%d/%m/%Y')}
            - Costo total: S/. {matricula.costo_total:.2f}

            💬 Recuerda que pronto podrás ver tus horarios y reservar tus clases prácticas desde tu cuenta.

            Gracias por elegirnos 🚗

            Atentamente,  
            Escuela de Manejo Jesús Nazareno
            """
        self.enviar_async(alumno.email, asunto, cuerpo)

email_service = EmailService()