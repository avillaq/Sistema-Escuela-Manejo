from datetime import datetime
from app.models import Reserva, Asistencia, Ticket, Bloque
from app.extensions import db
from sqlalchemy import func, and_
from werkzeug.exceptions import BadRequest

def registrar_asistencia(data):
    reserva = Reserva.query.get_or_404(data["id_reserva"])
    matricula = reserva.matricula
    asistio = data.get("asistio", True)
    alumno = matricula.alumno

    hoy = datetime.today()
    if asistio:
        if matricula.fecha_limite < hoy:
            raise BadRequest(f"La matrícula venció el {matricula.fecha_limite.strftime('%d/%m/%Y')}")
        
        asistencia_existente = Asistencia.query.filter_by(id_reserva=reserva.id).first()
        if asistencia_existente:
            raise BadRequest("Ya existe un registro de asistencia para esta reserva")

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

        # Actualizar horas completadas en la matricula
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