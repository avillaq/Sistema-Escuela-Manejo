from datetime import datetime, timedelta
from app.models import Reserva, Asistencia, Ticket, Bloque, Matricula, Alumno
from app.extensions import db
from sqlalchemy import func, and_
from werkzeug.exceptions import BadRequest
from app.datetime_utils import now_peru, today_peru, combine_peru

def registrar_asistencia(data):
    reserva = Reserva.query.get_or_404(data["id_reserva"])
    matricula = reserva.matricula
    asistio = data.get("asistio", True)
    # Verificar si ya existe un registro de asistencia
    asistencia_existente = Asistencia.query.filter_by(id_reserva=reserva.id).first()
    if asistencia_existente:
        raise BadRequest("Ya existe un registro de asistencia para esta reserva")

    # Verificar tolerancia de tiempo para registro de asistencia
    ahora = now_peru()
    fecha_bloque = reserva.bloque.fecha
    hora_inicio_bloque = reserva.bloque.hora_inicio
    tolerancia = 15 # minutos de tolerancia
    
    inicio_bloque = combine_peru(fecha_bloque, hora_inicio_bloque)
    limite_registro = inicio_bloque + timedelta(minutes=tolerancia)
    # Solo validar si no es del día actual o si ya pasó la tolerancia
    if fecha_bloque != ahora.date() or (fecha_bloque == ahora.date() and ahora > limite_registro):
        raise BadRequest(f"No se puede registrar asistencia. El bloque inició a las {hora_inicio_bloque.strftime('%H:%M')} y la tolerancia es de 15 minutos.")

    hoy = today_peru()
    if matricula.fecha_limite < hoy:
        raise BadRequest(f"La matrícula venció el {matricula.fecha_limite.strftime('%d/%m/%Y')}")
    
    if asistio:
        # Verificar si el instructor ya tiene una clase programada en ese horario
        instructor_ocupado = db.session.query(Ticket).join(Asistencia).join(Reserva).join(Bloque).filter(
            and_(
                Ticket.id_instructor == data["id_instructor"],
                func.date(Asistencia.fecha_asistencia) == hoy.date(),
                Bloque.fecha == reserva.bloque.fecha,
                # Verificar si el horario se solapa
                Bloque.hora_inicio < reserva.bloque.hora_fin,
                Bloque.hora_fin > reserva.bloque.hora_inicio
            )
        ).first()
        if instructor_ocupado:
            raise BadRequest("El instructor ya tiene una clase programada en ese horario")
        
        # Verificar si el auto ya está asignado a otra clase en ese horario
        auto_ocupado = db.session.query(Ticket).join(Asistencia).join(Reserva).join(Bloque).filter(
            and_(
                Ticket.id_auto == data["id_auto"],
                func.date(Asistencia.fecha_asistencia) == hoy.date(),
                Bloque.fecha == reserva.bloque.fecha,
                # Verificar si el horario se solapa
                Bloque.hora_inicio < reserva.bloque.hora_fin,
                Bloque.hora_fin > reserva.bloque.hora_inicio
            )
        ).first()
        if auto_ocupado:
            raise BadRequest("El auto ya está asignado a otra clase en ese horario")

    total_asistencias = matricula.horas_completadas
    nuevo_numero_clase = total_asistencias + 1

    if matricula.tipo_contratacion == "paquete" and matricula.paquete:
        total_clases = matricula.paquete.horas_total
    elif matricula.tipo_contratacion == "por_hora":
        total_clases = matricula.horas_contratadas
    else:
        total_clases = float("inf")
    if nuevo_numero_clase > total_clases:
        raise BadRequest(f"El alumno ya completó las {total_clases} horas contratadas")

    if nuevo_numero_clase >= 5 and matricula.estado_pago != "completo":
        raise BadRequest("El alumno debe completar el pago antes de tomar la quinta clase")

    asistencia = Asistencia(
        id_reserva=reserva.id,
        asistio=asistio,
        fecha_asistencia=now_peru()
    )
    db.session.add(asistencia)
    db.session.flush() 
    
    ticket = None
    if asistio:
        ticket = Ticket(
            id_asistencia=asistencia.id,
            numero_clase_alumno=nuevo_numero_clase,
            id_instructor=data["id_instructor"],
            id_auto=data["id_auto"]
        )
        db.session.add(ticket)

    # Actualizar horas completadas en la matricula, ya sea que asistió o no
    matricula.horas_completadas = nuevo_numero_clase
        
    if matricula.estado_clases != "completado":
        # Cambiar a "en_progreso" si aún no lo está
        if matricula.estado_clases == "pendiente":
            matricula.estado_clases = "en_progreso"
        
        # Si esta es la última clase del paquete, marcar como completado
        if nuevo_numero_clase >= total_clases:
            matricula.estado_clases = "completado"

    db.session.commit()
    return asistencia, ticket

def listar_asistencias(id_usuario=None):
    # Obtener alumno actual
    alumno = Alumno.query.filter_by(id_usuario=id_usuario).first()
    
    asistencias = db.session.query(
        Asistencia.id,
        Asistencia.asistio,
        Bloque.fecha.label('fecha_clase'),
        Bloque.hora_inicio,
        Bloque.hora_fin,
    ).select_from(Asistencia)\
    .join(Reserva, Asistencia.id_reserva == Reserva.id)\
    .join(Bloque, Reserva.id_bloque == Bloque.id)\
    .join(Matricula, Reserva.id_matricula == Matricula.id)\
    .filter(Matricula.id_alumno == alumno.id)\
    .order_by(Bloque.fecha.desc(), Bloque.hora_inicio.desc()).all()

    return asistencias