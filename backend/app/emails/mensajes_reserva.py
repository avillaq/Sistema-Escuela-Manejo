def mensaje_recordatorio_reserva(nombre, fecha, hora):
    asunto = "⏰ Recordatorio de tu clase de conducción"
    cuerpo = f"""
Hola {nombre},

Este es un recordatorio de que tienes una clase de conducción hoy {fecha} a las {hora}.

Por favor, asegúrate de llegar 10 minutos antes.

¡Nos vemos pronto!
Escuela de Conducción
"""
    return asunto, cuerpo