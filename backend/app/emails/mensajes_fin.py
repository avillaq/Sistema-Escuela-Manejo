def mensaje_final_clases(nombre, tipo):
    asunto = "¡Gracias por completar tus clases en nuestra escuela!"
    cuerpo = f"""
Hola {nombre},

Queremos agradecerte por haber completado todas tus clases de conducción. ¡Felicidades por este logro!

{ "Como contrataste un paquete, tu plan ha finalizado con éxito." if tipo == "paquete" else "Has completado todas las horas contratadas." }

Si deseas seguir practicando o perfeccionar tus habilidades, puedes inscribirte nuevamente eligiendo la modalidad por horas.

Para más información o reservas, contáctanos o visita nuestras oficinas.

¡Gracias por confiar en nosotros!
Escuela de Conducción
"""
    return asunto, cuerpo
