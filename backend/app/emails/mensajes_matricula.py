def mensaje_matricula_creada(nombre, tipo_contratacion, categoria, horas, tarifa, paquete, fecha_matricula, costo_total):
    asunto = "📄 Matrícula confirmada en la Escuela de Conducción"
    
    cuerpo = f"""
Hola {nombre},

¡Tu matrícula ha sido registrada con éxito!

📝 Detalles de la matrícula:
- Categoría: {categoria}
- Tipo de contratación: {tipo_contratacion}
"""
    if tipo_contratacion == "por_hora":
        cuerpo += f"""- Horas contratadas: {horas}
- Tarifa por hora: S/. {tarifa:.2f}
"""
    elif tipo_contratacion == "paquete" and paquete:
        cuerpo += f"""- Paquete: {paquete['nombre']} ({paquete['horas_total']} horas)
- Costo del paquete: S/. {paquete['costo_total']:.2f}
"""

    cuerpo += f"""
- Fecha de matrícula: {fecha_matricula.strftime('%d/%m/%Y')}
- Costo total: S/. {costo_total:.2f}

💬 Recuerda que pronto podrás ver tus horarios y reservar tus clases prácticas desde tu cuenta.

Gracias por elegirnos 🚗

Atentamente,  
Escuela de Conducción Profesional
"""
    return asunto, cuerpo