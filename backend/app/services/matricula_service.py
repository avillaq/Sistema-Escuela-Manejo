from datetime import datetime, timedelta
from app.models.matricula import Matricula
from app.models.alumno import Alumno
from app.models.paquete import Paquete
from app.models.asistencia import Asistencia
from app.models.reserva import Reserva
from app.models.pago import Pago
from app.extensions import db
from sqlalchemy import func
from werkzeug.exceptions import BadRequest

def crear_matricula(data):
    alumno = Alumno.query.get_or_404(data["id_alumno"])
    tipo_contratacion = data["tipo_contratacion"]

    fecha_matricula = datetime.now()
    fecha_limite = fecha_matricula + timedelta(days=30)

    if tipo_contratacion == "paquete":
        id_paquete = data.get("id_paquete")
        if not id_paquete:
            raise BadRequest("Las matrículas por paquete requieren un paquete")
            
        paquete = Paquete.query.get_or_404(id_paquete)
        
        # Crear matricula por paquete
        matricula = Matricula(
            id_alumno=alumno.id,
            id_paquete=id_paquete,
            tipo_contratacion="paquete",
            costo_total=paquete.costo_total,
            fecha_limite=fecha_limite,
        )

    elif tipo_contratacion == "por_hora":
        # Validar que se proporcionen las horas y tarifa
        if "horas_contratadas" not in data or "tarifa_por_hora" not in data:
            raise BadRequest("Las matrículas por hora requieren horas contratadas y tarifa por hora")
            
        horas_contratadas = data["horas_contratadas"]
        tarifa_por_hora = data["tarifa_por_hora"]
        
        # Calcular costo total
        costo_total = horas_contratadas * tarifa_por_hora
        
        # Crear matricula por hora
        matricula = Matricula(
            id_alumno=alumno.id,
            id_paquete=None,  # Sin paquete
            tipo_contratacion="por_hora",
            horas_contratadas=horas_contratadas,
            tarifa_por_hora=tarifa_por_hora,
            costo_total=costo_total,
            fecha_limite=fecha_limite,
        )
    else:
        raise BadRequest("Tipo de contratación no válido")

    db.session.add(matricula)
    db.session.commit()
    return matricula

def obtener_estado_cuenta(id_matricula):
    matricula = Matricula.query.get_or_404(id_matricula)
    
    # Calcular total pagado
    total_pagado = db.session.query(func.sum(Pago.monto)).filter_by(id_matricula=matricula.id).scalar() or 0
    
    # Calcular horas tomadas (para matrículas por hora)
    if matricula.tipo_contratacion == "por_hora":
        horas_tomadas = db.session.query(func.count(Asistencia.id)).join(Reserva).filter(
            Reserva.id_matricula == id_matricula,
            Asistencia.asistio == True
        ).scalar() or 0
    else:
        horas_tomadas = "No aplica"
    
    return {
        "matricula_id": matricula.id,
        "tipo_contratacion": matricula.tipo_contratacion,
        "costo_total": matricula.costo_total,
        "total_pagado": total_pagado,
        "saldo_pendiente": matricula.costo_total - total_pagado,
        "estado_pago": matricula.estado_pago,
        "horas_contratadas": matricula.horas_contratadas if matricula.tipo_contratacion == "por_hora" else matricula.paquete.horas_total,
        "horas_tomadas": horas_tomadas,
        "fecha_limite": matricula.fecha_limite.strftime("%Y-%m-%d")
    }

def listar_matriculas():
    return Matricula.query.all()  # TODO: agregar filtros y paginación

def eliminar_matricula(matricula_id):
    matricula = Matricula.query.get_or_404(matricula_id)
    db.session.delete(matricula)# TODO: Analizar si se debe eliminar o desactivar
    db.session.commit()
    return matricula