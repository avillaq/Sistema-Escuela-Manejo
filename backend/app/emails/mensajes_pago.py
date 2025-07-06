def mensaje_recordatorio_pago(nombre, saldo_pendiente):
    asunto = "💰 Recordatorio de pago pendiente - Escuela de Conducción"
    cuerpo = f"""
Hola {nombre},

Hemos notado que ya has iniciado tus clases en nuestra Escuela de Conducción, pero aún tienes un saldo pendiente de S/. {saldo_pendiente:.2f} por completar.

Te recordamos que es necesario regularizar el pago para continuar sin restricciones con tu formación.

Por favor, acércate a nuestras oficinas o contáctanos para completar el proceso de pago.

🚗 ¡Gracias por tu compromiso y responsabilidad!

Atentamente,  
Escuela de Conducción Profesional
"""
    return asunto, cuerpo