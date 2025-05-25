from datetime import datetime
from app.models import Reserva, Asistencia, Ticket
from app.extensions import db
from sqlalchemy import func
from werkzeug.exceptions import BadRequest

def registrar_asistencia(data):
    reserva = Reserva.query.get_or_404(data["id_reserva"])
    matricula = reserva.matricula
    asistio = data.get("asistio", True)
    alumno = matricula.alumno

    hoy = datetime.today().date()
    if asistio:
        if matricula.fecha_limite < hoy:
            raise BadRequest(f"La matrícula venció el {matricula.fecha_limite.strftime('%d/%m/%Y')}")
        
        asistencia_existente = Asistencia.query.filter_by(id_reserva=reserva.id).first()
        if asistencia_existente:
            raise BadRequest("Ya existe un registro de asistencia para esta reserva")
        
        if matricula.paquete and matricula.paquete.horas_total:
            if nuevo_numero_clase > matricula.paquete.horas_total:
                raise BadRequest(f"El alumno ya completó las {matricula.paquete.horas_total} horas de su paquete")
            
        if nuevo_numero_clase >= 5 and matricula.estado_pago != "completo":
            raise BadRequest("El alumno debe completar el pago antes de tomar la quinta clase")

        instructor_ocupado = Ticket.query.join(Asistencia).join(Reserva).join(Reserva.bloque).filter(
            Ticket.id_instructor == data["id_instructor"],
            func.date(Asistencia.fecha_asistencia) == hoy,
            # Verificar si el horario se solapa con el bloque actual
            Reserva.bloque.hora_inicio <= reserva.bloque.hora_fin,
            Reserva.bloque.hora_fin >= reserva.bloque.hora_inicio
        ).first()
        if instructor_ocupado:
            raise BadRequest("El instructor ya tiene una clase programada en ese horario")
        
        auto_ocupado = Ticket.query.join(Asistencia).join(Reserva).join(Reserva.bloque).filter(
            Ticket.id_auto == data["id_auto"],
            func.date(Asistencia.fecha_asistencia) == hoy,
            # Verificar si el horario se solapa con el bloque actual
            Reserva.bloque.hora_inicio <= reserva.bloque.hora_fin,
            Reserva.bloque.hora_fin >= reserva.bloque.hora_inicio
        ).first()
        if auto_ocupado:
            raise BadRequest("El auto ya está asignado a otra clase en ese horario")

        total_asistencias = Asistencia.query.join(Reserva).filter(
            Reserva.id_matricula == matricula.id
        ).count()
        nuevo_numero_clase = total_asistencias + 1

    asistencia = Asistencia(
        id_reserva=reserva.id,
        asistio=asistio,
        fecha_asistencia=datetime.now()
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
            
        if matricula.paquete and matricula.estado_clases != "completado":
            # Cambiar a "en_progreso" si aún no lo está
            if matricula.estado_clases == "pendiente":
                matricula.estado_clases = "en_progreso"
            
            # Si esta es la última clase del paquete, marcar como completado
            if nuevo_numero_clase >= matricula.paquete.horas_total:
                matricula.estado_clases = "completado"

    db.session.commit()
    return asistencia, ticket
