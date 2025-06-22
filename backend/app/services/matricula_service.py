from datetime import datetime, timedelta, date
from app.models.bloque import Bloque
from app.models.reserva import Reserva
from app.models.asistencia import Asistencia
from app.models.matricula import Matricula
from app.models.alumno import Alumno
from app.models.paquete import Paquete
from app.models.pago import Pago
from app.extensions import db
from sqlalchemy import func
from werkzeug.exceptions import BadRequest

def crear_matricula(data):
    alumno = Alumno.query.get_or_404(data["id_alumno"])
    
    # Validar que el alumno esté activo
    if not alumno.activo:
        raise BadRequest("El alumno no está activo")
    
    # Validar que el alumno no tenga una matrícula activa segun su estado de clases
    if any(matricula.estado_clases in ["en_progreso", "pendiente"] for matricula in alumno.matriculas):
        raise BadRequest("El alumno ya tiene una matrícula activa")

    tipo_contratacion = data["tipo_contratacion"]
    categoria = data["categoria"]

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
            categoria=categoria,
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
            categoria=categoria,
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
    
    horas_completadas = matricula.horas_completadas
    
    return {
        "matricula_id": matricula.id,
        "tipo_contratacion": matricula.tipo_contratacion,
        "costo_total": matricula.costo_total,
        "total_pagado": total_pagado,
        "saldo_pendiente": matricula.costo_total - total_pagado,
        "estado_pago": matricula.estado_pago,
        "horas_contratadas": matricula.horas_contratadas if matricula.tipo_contratacion == "por_hora" else matricula.paquete.horas_total,
        "horas_completadas": horas_completadas,
        "fecha_limite": matricula.fecha_limite.strftime("%Y-%m-%d")
    }

def listar_matriculas(id_alumno=None): # TODO: agregar filtros y paginación
    if id_alumno:
        # Filtrar matricula con estado de clases activo (pendiente, en_progreso)
        matricula = db.session.query(Matricula).join(Alumno).outerjoin(Paquete).filter(
            Matricula.id_alumno == id_alumno,
            Matricula.estado_clases.in_(["pendiente", "en_progreso"])
        ).first()
        
        # Calcular pagos realizados
        pagos_realizados = db.session.query(func.sum(Pago.monto)).filter_by(id_matricula=matricula.id).scalar() or 0.0

        # Calcular reservas pendientes (futuras sin asistencia)
        hoy = date.today()
        reservas_pendientes = db.session.query(func.count(Reserva.id)).join(Bloque).filter(
            Reserva.id_matricula == matricula.id,
            Bloque.fecha >= hoy
        ).outerjoin(Asistencia).filter(
            Asistencia.id.is_(None)  # Sin asistencia registrada
        ).scalar() or 0

        # Horas disponibles para nuevas reservas
        if matricula.tipo_contratacion == "paquete":
            horas_contratadas = matricula.paquete.horas_total
        else:
            horas_contratadas = matricula.horas_contratadas
        
        horas_disponibles_reserva = horas_contratadas - matricula.horas_completadas - reservas_pendientes
        
        # atributos temporales
        matricula.pagos_realizados = float(pagos_realizados)
        matricula.saldo_pendiente = float(matricula.costo_total - pagos_realizados)
        matricula.reservas_pendientes = reservas_pendientes
        matricula.horas_disponibles_reserva = horas_disponibles_reserva
        
        return matricula

    else:  
        matriculas = db.session.query(Matricula).join(Alumno).outerjoin(Paquete).all()
        
        for matricula in matriculas:
            # Calcular pagos realizados
            pagos_realizados = db.session.query(func.sum(Pago.monto)).filter_by(id_matricula=matricula.id).scalar() or 0.0
            
            #  atributos temporales
            matricula.pagos_realizados = float(pagos_realizados)
            matricula.saldo_pendiente = float(matricula.costo_total - pagos_realizados)
        
        return matriculas

def eliminar_matricula(matricula_id):
    matricula = Matricula.query.get_or_404(matricula_id)
    db.session.delete(matricula)# TODO: Analizar si se debe eliminar o desactivar
    db.session.commit()
    return matricula