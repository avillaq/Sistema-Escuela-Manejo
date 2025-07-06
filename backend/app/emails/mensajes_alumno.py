# app/emails/mensajes_alumno.py

def mensaje_bienvenida(nombre_alumno):
    asunto = "🎉 ¡Bienvenido a la Escuela de Conducción Profesional!"
    cuerpo = f"""
Hola {nombre_alumno},

¡Te damos la más cordial bienvenida a nuestra Escuela de Conducción!

Tu registro ha sido exitosamente completado. A partir de ahora formas parte de una comunidad comprometida con la educación vial segura y responsable.

📅 En los próximos días recibirás más información sobre tu matrícula, horarios y clases asignadas.

Si tienes alguna duda o necesitas ayuda, no dudes en contactarnos.

🚗 ¡Gracias por confiar en nosotros y mucho éxito en esta nueva etapa!

Atentamente,  
Escuela de Conducción Profesional
"""
    return asunto, cuerpo
